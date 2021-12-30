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

1. 証明書ファイル(`privkey.pem`, `cert.pem`)を`nginx/nginx.conf`と同じディレクトリに配置([理由](#証明書ファイルを複製する理由))
2. `users.json`で初期ユーザー情報を設定(管理者必須)
3. (任意)`streams.json`で初期配信枠を設定
4. `docker-compose.yml`があるディレクトリ上で`$ docker-compose up`を実行

※ ユーザー情報と配信枠は、起動後に管理者ページから追加・変更・削除が可能です。

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

### 証明書ファイルを複製する理由

Dockerfileには、**親ディレクトリを参照できない**という仕様があります。  
例えば、`COPY ../hoge .`といったことができません。

これは、`docker build`がcontext対象ディレクトリ(とサブディレクトリ)のみをdockerデーモンに送信するためです。

context対象ディレクトリとは、各Dockerfileでイメージをビルドする時のワーキングディレクトリ、すなわち`docker build`を実行する場所を指します。  
これは`docker-compose.yml`の`build: context`で任意指定できます。

参照したいファイルが一階層上程度であれば`docker build -f`で対処可能ですが、証明書の場合は場所が離れているため、単純にファイルを複製するという手段をとりました。
