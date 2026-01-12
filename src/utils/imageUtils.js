const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

/**
 * HTML content의 이미지 상대 경로를 전체 URL로 변환 (조회/편집 시)
 * /post-images/xxx.png → http://localhost:8080/post-images/xxx.png
 * 
 * @param {string} html - HTML 문자열
 * @returns {string} 변환된 HTML
 */
export const convertRelativeToAbsoluteUrls = (html) => {
    if (!html) return html;

    const processed = html.replace(
        /<img([^>]*?)src="(\/[^"]+)"([^>]*?)>/gi,
        (match, before, src, after) => {
            // 이미 전체 URL이면 그대로
            if (src.startsWith('http://') || src.startsWith('https://')) {
                return match;
            }

            // 상대 경로면 전체 URL로 변환
            const fullUrl = `${API_BASE_URL}${src}`;

            return `<img${before}src="${fullUrl}"${after}>`;
        }
    );

    return processed;
};

/**
 * HTML content의 이미지 전체 URL을 상대 경로로 변환 (저장 시)
 * http://localhost:8080/post-images/xxx.png → /post-images/xxx.png
 * 
 * @param {string} html - HTML 문자열
 * @returns {string} 변환된 HTML
 */
export const convertAbsoluteToRelativeUrls = (html) => {
    if (!html) return html;

    const processed = html.replace(
        new RegExp(`(<img[^>]*?)src="${API_BASE_URL}(/[^"]+)"([^>]*?)>`, 'gi'),
        (match, before, src, after) => {
            return `${before}src="${src}"${after}>`;
        }
    );

    return processed;
};

/**
 * 이미지 업로드 후 반환된 경로를 CKEditor용 전체 URL로 변환
 * 백엔드가 상대 경로를 반환하는 경우에 사용
 * 
 * @param {string} imagePath - 서버에서 반환된 이미지 경로
 * @returns {string} 전체 URL
 */
export const convertUploadedImagePath = (imagePath) => {
    if (!imagePath) return imagePath;

    // 이미 전체 URL이면 그대로 반환
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
        return imagePath;
    }

    // 상대 경로면 전체 URL로 변환
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    const fullUrl = `${API_BASE_URL}${cleanPath}`;

    return fullUrl;
};

/**
 * 단일 이미지 URL을 전체 URL로 변환 (썸네일, 프로필 이미지 등)
 * /diary-images/xxx.png → http://localhost:8080/diary-images/xxx.png
 * null/undefined → null/undefined (그대로 반환)
 * 
 * @param {string|null|undefined} imageUrl - 이미지 URL
 * @returns {string|null|undefined} 전체 URL 또는 원본
 */
export const getFullImageUrl = (imageUrl) => {
    // null, undefined, 빈 문자열은 그대로 반환
    if (!imageUrl) {
        return imageUrl;
    }

    // 이미 전체 URL이면 그대로 반환
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // 상대 경로면 전체 URL로 변환
    const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    const fullUrl = `${API_BASE_URL}${cleanPath}`;

    return fullUrl;
};

/**
 * 이미지 URL 배열을 전체 URL 배열로 변환
 * ['/diary-images/a.png', '/diary-images/b.png'] 
 * → ['http://localhost:8080/diary-images/a.png', 'http://localhost:8080/diary-images/b.png']
 * 
 * @param {string[]|null|undefined} imageUrls - 이미지 URL 배열
 * @returns {string[]|null|undefined} 전체 URL 배열 또는 원본
 */
export const getFullImageUrls = (imageUrls) => {
    if (!imageUrls || !Array.isArray(imageUrls)) {
        return imageUrls;
    }

    return imageUrls.map(url => getFullImageUrl(url));
};

/**
 * URL에서 경로만 추출
 * http://localhost:8080/post-images/xxx.png → /post-images/xxx.png
 * /post-images/xxx.png → /post-images/xxx.png
 * 
 * @param {string} url - 이미지 URL
 * @returns {string} 추출된 경로
 */
export const extractPathFromUrl = (url) => {
    if (!url || url.startsWith('/')) {
        return url;
    }

    try {
        // protocol://host/path 형태에서 path 추출
        const protocolEnd = url.indexOf('://');
        if (protocolEnd !== -1) {
            const pathStart = url.indexOf('/', protocolEnd + 3);
            if (pathStart !== -1) {
                return url.substring(pathStart);
            }
        }
    } catch (e) {
        console.warn('URL 파싱 실패, 원본 반환:', url, e);
    }

    return url;
};

/**
 * API Base URL 반환
 * @returns {string} API Base URL
 */
export const getApiBaseUrl = () => API_BASE_URL;

// 하위 호환성을 위한 별칭
export const convertRelativeImageUrls = convertRelativeToAbsoluteUrls;
export const convertAbsoluteImageUrls = convertAbsoluteToRelativeUrls;
