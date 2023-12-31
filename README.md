# End-to-end encrypted file sharing

I wanted to share images across all my devices with maximum security through encryption.
This was the opportunity to learn how to use the WebCrypto API.

## Requirements

- Cargo
- Node
- Npm

## Getting started

1. As the WebCrypto requires https, you have to generate a SSL certificate for the API.  
   You can use the following command to generate one with OpenSSL.
   ```shell
   openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/localhost.key -out nginx/ssl/localhost.crt -sha256 -days 365 -nodes
   ```

2. Start the front end with
    ```shell
    npm run dev
    ```

3. Start the back end with
   ```shell
   cd api
   cargo run
   ```
