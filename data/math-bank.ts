
import type { Grade } from '../types';

export const mathBank: Grade[] = [
  {
    id: 'grade-12',
    name: 'Toán 12',
    chapters: [
      {
        id: 'g12-c1',
        name: 'Chương I: Ứng dụng đạo hàm để khảo sát và vẽ đồ thị của hàm số',
        topics: [
          {
            id: 'g12-c1-t1',
            name: 'Bài 1: Sự đồng biến, nghịch biến của hàm số',
            questions: [
              { id: 'g12c1t1q1', text: 'Cho hàm số $y = x^3 - 3x^2$. Mệnh đề nào dưới đây đúng?' },
              { id: 'g12c1t1q2', text: 'Tìm các khoảng nghịch biến của hàm số $y = -x^4 + 2x^2 + 1$.' },
              { id: 'g12c1t1q3', text: 'Hỏi hàm số $y = \\frac{2x-1}{x+1}$ đồng biến trên các khoảng nào?' },
              { id: 'g12c1t1q4', text: 'Tìm tất cả các giá trị thực của tham số m để hàm số $y=x^3-6x^2+mx-1$ đồng biến trên khoảng $(0;+\\infty)$.' },
            ],
          },
          {
            id: 'g12-c1-t2',
            name: 'Bài 2: Cực trị của hàm số',
            questions: [
              { id: 'g12c1t2q1', text: 'Tìm điểm cực đại của hàm số $y = x^3 - 3x + 2$.' },
              { id: 'g12c1t2q2', text: 'Hàm số $y = x^4 - 2x^2 + 2$ có bao nhiêu điểm cực trị?' },
            ],
          },
        ],
      },
      {
        id: 'g12-c2',
        name: 'Chương II: Hàm số lũy thừa, hàm số mũ và hàm số logarit',
        topics: [
          {
            id: 'g12-c2-t1',
            name: 'Bài 1: Lũy thừa',
            questions: [
              { id: 'g12c2t1q1', text: 'Tính giá trị của biểu thức $P = (\\sqrt[3]{8})^2 + (\\frac{1}{16})^{-\\frac{3}{4}}$' },
            ],
          },
        ],
      },
    ],
  },
   {
    id: 'grade-11',
    name: 'Toán 11',
    chapters: [
        {
            id: 'g11-c1',
            name: 'Chương I: Hàm số lượng giác và phương trình lượng giác',
            topics: [
                {
                    id: 'g11-c1-t1',
                    name: 'Bài 1: Hàm số lượng giác',
                    questions: [
                        {id: 'g11c1t1q1', text: 'Tìm tập xác định của hàm số $y = \\tan(2x - \\frac{\\pi}{3})$.'}
                    ]
                }
            ]
        }
    ]
   },
   {
    id: 'grade-10',
    name: 'Toán 10',
    chapters: [
        {
            id: 'g10-c1',
            name: 'Chương I: Mệnh đề và tập hợp',
            topics: [
                {
                    id: 'g10-c1-t1',
                    name: 'Bài 1: Mệnh đề',
                    questions: [
                        {id: 'g10c1t1q1', text: 'Trong các câu sau, câu nào là mệnh đề?'}
                    ]
                }
            ]
        }
    ]
   }
];
