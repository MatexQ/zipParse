## zip-parser:
You can upload files from zip to server.

For proper operation requires module [Formidable](https://github.com/felixge/node-formidable)

## Example:
```javascript
const zipParser = require('zip-parser');

const zip = zipParser.init({
    path: {
        html: {
          relative: '/assets/html',
          absolute: '/home/user/projects/zip-parser/assets/html'
        },
        img: {
          relative: '/assets/img',
          absolute: '/home/user/projects/zip-parser/assets/img'
        }
      }
});

```

## Available methods:
- init
- parse

## Init
You can give path like this:
```
path: {
    html: {
        relative: '/assets/html',
            absolute: '/home/user/projects/zip-parser/assets/html'
    },
    img: {
        relative: '/assets/img',
            absolute: '/home/user/projects/zip-parser/assets/img'
    }
}
```

or like this
```
path: {
    relative: '/assets',
    absolute: '/home/user/projects/zip-parser/assets',
  }
```

If you used Formidable then you have to pass it on to **parse** function:
```javascript
zip.parse(file);
```

