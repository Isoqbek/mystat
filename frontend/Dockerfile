FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Bitta domen: API shu hostning /api/ yo'lida (nginx Django'ga proxy qiladi)
ARG VITE_API_URL=/
ENV VITE_API_URL=$VITE_API_URL

# Yangi ommaviy dizayn (bosh sahifa v2 va qobiq) faqat shu bayroq bilan yig'iladi
ARG VITE_PUBLIC_V2=1
ENV VITE_PUBLIC_V2=$VITE_PUBLIC_V2
RUN npm run build

FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
