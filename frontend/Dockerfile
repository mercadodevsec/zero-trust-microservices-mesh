FROM node:20-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install

COPY . .

# Vite inlines VITE_* env vars into the bundle at build time, not runtime —
# so this has to be a build arg, not a container `environment:` entry.
ARG VITE_API_URL=http://localhost:3000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM node:20-alpine

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/dist ./dist
RUN npm install -g serve

EXPOSE 4173

CMD ["serve", "-s", "dist", "-l", "4173"]
