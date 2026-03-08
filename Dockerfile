# Build stage - React 빌드
FROM node:18-alpine AS build
WORKDIR /app

# package.json과 package-lock.json 복사
COPY package*.json ./

# npm install 사용 (npm ci 대신)
RUN npm install

# 소스 코드 복사
COPY . .

# 프로덕션 빌드 생성
RUN npm run build

# Production stage - Nginx로 정적 파일 서빙
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf

WORKDIR /usr/share/nginx/html

# 기존 nginx 기본 파일 삭제
RUN rm -rf ./*

# 빌드된 파일을 nginx 디렉토리로 복사
COPY --from=build /app/build /usr/share/nginx/html

# 포트 노출
EXPOSE 80

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]