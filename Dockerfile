FROM node:20

WORKDIR /app
USER root
COPY . .

FROM node:20

WORKDIR /app

COPY . .

# Restore original MeshCentral 1.2.4 agent binaries.
# Local Windows antivirus/Git must not affect binaries inside Docker image.
RUN mkdir -p /tmp/meshcentral-upstream \
    && cd /tmp/meshcentral-upstream \
    && npm pack meshcentral@1.2.4 \
    && tar -xzf meshcentral-1.2.4.tgz \
    && rm -rf /app/agents \
    && cp -a package/agents /app/agents \
    && rm -rf /tmp/meshcentral-upstream

RUN npm pkg delete dependencies.node-windows

RUN npm install

EXPOSE 80
EXPOSE 443

CMD ["node", "meshcentral.js"]