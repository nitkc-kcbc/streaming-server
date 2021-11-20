# KCBC Live Streaming System

Basic認証付きの簡易的な配信システム

## システム構成

### Docker Compose

* Nginx with nginx-rtmp-module
* Node.js
  * express
  * passport
  * hls.js

## 使用方法

### ホスト環境設定

1. [Docker](https://www.docker.com/get-started)のインストール
2. Dockerの起動
3. (任意)メモリ使用量の上限を変更([参照](#メモリ使用量の上限の設定方法))

動作が重く感じた場合は(3)の設定を行ってください。

### 起動

1. `nodejs-app/db/users-template.js`を`users.js`として同じディレクトリに複製
2. `users.js`でユーザ情報を設定
3. `docker-compose.yml`があるディレクトリ上で`$ docker-compose up`を実行

※ 初回はイメージ作成が含まれるため、実行までに時間がかかります。

※ バックグラウンドで実行する場合は`$ docker-compose up -d`で実行。

### 停止

`Ctrl+C`または`$ docker-compose stop`

### ログの閲覧

`$ docker-compose logs -f`

※ `-f`オプションはリアルタイムでログを出力し続けます。

## 開発者向け

### ソース変更後の実行方法

* `docker-compose.yml`の変更後は`$ docker-compose up`で実行。
* `Dockerfile`の変更後は`$ docker-compose up --build`で実行。

### メモリ使用量の上限の設定方法

#### Windows 10 (WSL 2 based)

デフォルト値は「メモリ合計容量の50%と8GBのうち小さい方」または「20175ビルド以前の場合、メモリ合計容量の80%」となっています。  
(cf. <https://docs.microsoft.com/en-us/windows/wsl/wsl-config#options-for-wslconfig>)

1. `%USERPROFILE%\.wslconfig`を以下のように変更
2. wslの再起動

```plain
[wsl2]
memory=6GB
```

※ 上限サイズは適宜変更してください。

#### MacOS

デフォルト値は2GBとなっています。

1. 「Docker Desktop for Mac」を開く
2. 「Settings」から「Resources」を表示
3. 「Memory」項目のスライダーで値を変更
4. 右下の「Apply & Restart」で変更を反映
