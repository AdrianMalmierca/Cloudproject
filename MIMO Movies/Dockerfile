############################
# BUILD STAGE
############################
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Compilar TypeScript → dist/
RUN npm run build


############################
# RUNTIME STAGE
############################
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/dist ./dist

EXPOSE 3000
ENV PORT=3000

CMD ["sh", "-c", "node dist/scripts/seed.js && node dist/index.js"]