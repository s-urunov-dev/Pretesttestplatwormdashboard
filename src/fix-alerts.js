// Quick fix script to replace the alert messages
const fs = require('fs');

const filePath = '/pages/AddQuestionPage.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Replace Reading alert
content = content.replace(
  /alert\(\s*'⚠️ Bu Reading uchun barcha 3 ta passage allaqachon yaratilgan!\\\\n\\\\n' \+\s*'Har bir Reading faqat 3 ta passage \(Passage 1, 2, 3\) ga ega bo\\\\'lishi mumkin\.\\\\n\\\\n' \+\s*'📝 Variantlar:\\\\n' \+\s*'1\. Yangi Test yaratib, yangi Reading qo\\\\'shing\\\\n' \+\s*'2\. Mavjud Passage\\\\'ni tahrirlang \(keyingi versiyada qo\\\\'shiladi\)\\\\n' \+\s*'3\. Boshqa Test\\\\'ni tanlang'\s*\);/g,
  `const msg = '⚠️ Bu Reading uchun barcha 3 ta passage allaqachon yaratilgan!\\n\\nHar bir Reading faqat 3 ta passage (Passage 1, 2, 3) ga ega bo\\'lishi mumkin.\\n\\n📝 Variantlar:\\n1. Yangi Test yaratib, yangi Reading qo\\'shing\\n2. Mavjud Passage\\'ni tahrirlang (keyingi versiyada qo\\'shiladi)\\n3. Boshqa Test\\'ni tanlang';
        alert(msg);`
);

// Replace Listening alert
content = content.replace(
  /alert\(\s*'⚠️ Bu Listening uchun barcha 4 ta part allaqachon yaratilgan!\\\\n\\\\n' \+\s*'Har bir Listening faqat 4 ta part \(Part 1, 2, 3, 4\) ga ega bo\\\\'lishi mumkin\.\\\\n\\\\n' \+\s*'📝 Variantlar:\\\\n' \+\s*'1\. Yangi Test yaratib, yangi Listening qo\\\\'shing\\\\n' \+\s*'2\. Mavjud Part\\\\'ni tahrirlash \(keyingi versiyada qo\\\\'shiladi\)\\\\n' \+\s*'3\. Boshqa Test\\\\'ni tanlang'\s*\);/g,
  `const msg = '⚠️ Bu Listening uchun barcha 4 ta part allaqachon yaratilgan!\\n\\nHar bir Listening faqat 4 ta part (Part 1, 2, 3, 4) ga ega bo\\'lishi mumkin.\\n\\n📝 Variantlar:\\n1. Yangi Test yaratib, yangi Listening qo\\'shing\\n2. Mavjud Part\\'ni tahrirlang (keyingi versiyada qo\\'shiladi)\\n3. Boshqa Test\\'ni tanlang';
        alert(msg);`
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed!');
