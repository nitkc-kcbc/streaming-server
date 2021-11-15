# KCBC Live Streaming System

Basic認証付きの簡易的な配信システム

## システム構成

### Docker Compose

* Nginx with nginx-rtmp-module
* Node.js
  * express
  * passport
  * hls.js

## 実行方法

1. `nodejs-app/db/users-template.js`を`users.js`として同じディレクトリに複製。
2. `users.js`でユーザ情報を設定。
3. `docker-compose.yml`があるディレクトリ上で`$ docker-compose up`を実行。

※ 初回はイメージ作成が含まれるため、実行までに時間がかかります。

## 開発者向け

`docker-compose.yml`や`Dockerfile`の変更後は`$ docker-compose up --build`で実行。
