import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());
app.use(express.json());

const GITHUB_TOKENS_URL = 'https://raw.githubusercontent.com/YaNesyTortiK/AnimeParsers/main/kdk_tokns/tokens.json';
let currentToken = null;
let isRefreshing = false;

function decryptToken(encryptedToken) {
    try {
        const half = encryptedToken.length / 2;
        const p1 = encryptedToken.slice(0, half).split('').reverse().join('');
        const p2 = encryptedToken.slice(half).split('').reverse().join('');
        const decodedP1 = Buffer.from(p1, 'base64').toString('utf-8');
        const decodedP2 = Buffer.from(p2, 'base64').toString('utf-8');
        return decodedP2 + decodedP1;
    } catch (e) {
        console.error('Ошибка расшифровки токена:', e.message);
        return null;
    }
}

async function loadTokensFromGitHub() {
    try {
        const res = await fetch(GITHUB_TOKENS_URL);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const allTokens = [
            ...(data.stable || []),
            ...(data.unstable || []),
            ...(data.legacy || [])
        ];
        const tokens = allTokens
            .map(item => decryptToken(item.tokn))
            .filter(t => t !== null);
        console.log(`Загружено токенов: ${tokens.length}`);
        return tokens;
    } catch (err) {
        console.error('Ошибка загрузки токенов:', err.message);
        return [];
    }
}

async function testToken(token) {
    try {
        const params = new URLSearchParams({ token, title: 'аниме', limit: 1 });
        const res = await fetch(`https://kodik-api.com/search?${params.toString()}`);
        console.log(`Статус проверки токена: ${res.status}`);
        return res.ok;
    } catch (e) {
        console.error('Ошибка testToken:', e.message);
        return false;
    }
}

async function findWorkingToken() {
    const tokens = await loadTokensFromGitHub();
    if (tokens.length === 0) {
        console.error('Список токенов пуст');
        return null;
    }
    for (const token of tokens) {
        console.log(`Проверяем токен: ${token.slice(0, 10)}...`);
        const ok = await testToken(token);
        if (ok) {
            console.log(`✅ Найден рабочий токен: ${token.slice(0, 15)}...`);
            return token;
        }
    }
    console.error('Ни один токен не прошёл проверку');
    return null;
}

async function refreshToken() {
    if (isRefreshing) return false;
    isRefreshing = true;
    try {
        const newToken = await findWorkingToken();
        if (newToken) {
            currentToken = newToken;
            console.log('Токен обновлён');
            return true;
        }
        return false;
    } finally {
        isRefreshing = false;
    }
}

(async function init() {
    console.log('Инициализация сервера...');
    const token = await findWorkingToken();
    if (token) {
        currentToken = token;
        console.log('Сервер готов');
    } else {
        console.error('Не удалось получить токен при старте');
    }
})();

async function ensureToken(req, res, next) {
    if (!currentToken) {
        console.log('Токен отсутствует, запускаем поиск...');
        await refreshToken();
    }
    if (!currentToken) {
        return res.status(503).json({ error: 'API Kodik временно недоступен, повторите позже' });
    }
    next();
}

function parseKodikForPlayer(results) {
    if (!results || results.length === 0) return null;

    const translationsMap = new Map();
    let episodesCount = 0;

    for (const item of results) {
        const eps = item.episodes_count || item.last_episode || 1;
        if (eps > episodesCount) episodesCount = eps;

        const t = item.translation;
        if (t && !translationsMap.has(t.id)) {
            translationsMap.set(t.id, {
                id: t.id,
                title: t.title,
                type: t.type,
                link: item.link
            });
        }
    }

    return {
        episodesCount,
        translations: Array.from(translationsMap.values())
    };
}

app.get('/api/kodik/search', ensureToken, async (req, res) => {
    const { title, shikimori_id, limit = 20 } = req.query;
    try {
        const params = new URLSearchParams({ token: currentToken, limit });
        if (title) params.append('title', title);
        if (shikimori_id) params.append('shikimori_id', shikimori_id);

const response = await fetch(`https://kodik-api.com/search?${params.toString()}`);

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                console.log('Токен отвергнут Kodik, обновляем...');
                await refreshToken();
                return res.status(401).json({ error: 'Токен устарел, повторите запрос' });
            }
            throw new Error(`Kodik API error: ${response.status}`);
        }

        const data = await response.json();

        if (shikimori_id) {
            const parsed = parseKodikForPlayer(data.results);
            if (!parsed || parsed.translations.length === 0) {
                return res.status(404).json({ error: 'Аниме не найдено в Kodik' });
            }
            return res.json(parsed);
        }

        res.json(data);
    } catch (err) {
        console.error('Ошибка прокси:', err);
        res.status(500).json({ error: 'Ошибка на сервере' });
    }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
    console.log(`Бэкенд запущен на http://localhost:${PORT}`);
});