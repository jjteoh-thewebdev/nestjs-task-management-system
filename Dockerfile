######
# BASE
######
FROM node:20-alpine as base
RUN npm i -g pnpm

##############
# INSTALL DEPS
##############
FROM base as development

WORKDIR /home/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY prisma ./prisma/

RUN pnpm install

#######
# BUILD
#######
FROM base as build

WORKDIR /home/app

COPY . .
COPY --from=development /home/app/node_modules ./node_modules
# COPY --from=development /home/app/prisma ./prisma

# Generate Prisma Client
RUN pnpm run prisma:generate

RUN pnpm run build

############
# PRODUCTION
############
FROM base as production

WORKDIR /home/app

COPY --from=build /home/app/node_modules ./node_modules
COPY --from=build /home/app/dist ./dist

CMD ["node", "dist/src/main.js"]