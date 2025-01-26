FROM node:23-alpine

WORKDIR /workspace

# 開発に必要なツールをインストール
RUN apk add --no-cache git git-lfs python3

# Git LFS を設定
RUN git lfs install

# package.jsonとyarn.lockを先にコピー
COPY package.json yarn.lock ./

# 依存関係をインストール
RUN yarn install --frozen-lockfile

# ソースコードをコピー
COPY . .

# VS Code Extension開発用のCLIをインストール
RUN yarn global add @vscode/vsce

# Python UV をインストール
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /workspace/sample-python-project
RUN uv sync

WORKDIR /workspace

# 開発サーバーを起動
CMD ["yarn", "watch"]