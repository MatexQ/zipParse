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
          absolute: '/home/user/projects/zip-parser/assets/html,
        },
        img: {
          relative: '/assets/img',
          absolute: '/home/user/projects/zip-parser/assets/img',
        }
      }
});

zip.parse(file);
```

## Available methods:
- init
- parse

If you used Formidable then you have to pass it on to **parse** function.

