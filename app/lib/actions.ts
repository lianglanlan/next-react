'use server';

export const createInvoice = async (formData: FormData) => {
  // const rawFormData = {
  //   customerId: formData.get('customerId'),
  //   amount: formData.get('amount'),
  //   status: formData.get('status'),
  // };
  const rawFormData = Object.fromEntries(formData.entries());
  console.log(rawFormData);
  /* 选择表单进行操作，最后点提交，打印结果
  {
    '$ACTION_ID_a5b783090ca6573b8898d600e86326101a894424': '',
    customerId: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    amount: '5',
    status: 'paid'
  }*/
};
