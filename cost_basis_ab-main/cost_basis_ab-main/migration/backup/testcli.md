# CLI description
    node index.js <mode> <params>
    - upload
        node index.js upload <uploadMongoURI> <localDataPath>
        localDataPath's default value is `data`
    
    - download
        node index.js upload <downloadMongoURI> <localDataPath>
        localDataPath's default value is `data`

    - switch
        node index.js switch <downloadMongoURI> <uploadMongoURI>

## Upload CLI
    node index.js upload mongodb+srv://root:W1nn3b8g0$@cluster0.5gtpp.mongodb.net/DefiReturn1
    node index.js upload mongodb+srv://root:W1nn3b8g0$@cluster0.5gtpp.mongodb.net/DefiReturn1 data2

## Download CLI
    node index.js download mongodb+srv://root:W1nn3b8g0$@cluster0.5gtpp.mongodb.net/DefiReturn
    node index.js download mongodb+srv://root:W1nn3b8g0$@cluster0.5gtpp.mongodb.net/DefiReturn data2
    
## Switch Database CLI
    node index.js switch mongodb+srv://root:W1nn3b8g0$@cluster0.5gtpp.mongodb.net/DefiReturn mongodb+srv://root:W1nn3b8g0$@cluster0.5gtpp.mongodb.net/DefiReturn1