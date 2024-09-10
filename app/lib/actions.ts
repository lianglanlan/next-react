'use server';
import { z } from 'zod';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  amount: z.coerce.number(),
  status: z.enum(['pending', 'paid']),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });

export const createInvoice = async (formData: FormData) => {
  const rawFormData = CreateInvoice.parse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });
  // Object.fromEntries() 静态方法将键值对列表转换为一个对象。
  // const rawFormData = Object.fromEntries(formData.entries());
  console.log(rawFormData);
  /* 选择表单进行操作，最后点提交，打印结果
  {
    '$ACTION_ID_a5b783090ca6573b8898d600e86326101a894424': '',
    customerId: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    amount: '5',
    status: 'paid'
  }*/

  /**
     * 加完类型验证后，打印
     * {
        customerId: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
        amount: 123,
        status: 'paid'
      }
  */
};
