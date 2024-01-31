'use server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';

// validate form
const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
        invalid_type_error: 'Please select a customer.',
    }),
    // amount设置：强制将字符串转变数字，同时也验证其类型。因为前端获得的amount为string类型
    amount: z.coerce.number()
        .gt(0, { message: 'Please enter an amount greater than $0.' }),

    status: z.enum(['pending', 'paid'], { invalid_type_error: 'Please select an invoice status.' }),
    date: z.string(),
});

// 使用 .omit() 方法排除 id 和 date 字段
const CreateInvoice = FormSchema.omit({ id: true, date: true });


// This is temporary until @types/react-dom is updated
export type State = {
    errors?: {
        customerId?: string[];
        amount?: string[];
        status?: string[];
    };
    message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData) {
    // const { customerId, amount, status } = CreateInvoice.parse({
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    // If form validation fails, return errors early. Otherwise, continue.
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: 'Missing Fields. Failed to Create Invoice.',
        };
    }

    // 开始进入数据处理逻辑
    // Prepare data for insertion into the database
    const { customerId, amount, status } = validatedFields.data;
    // 美元转成美分
    const amountInCents = amount * 100;
    // format "YYYY-MM-DD"
    const date = new Date().toISOString().split('T')[0];
    // Test it out:
    console.log(customerId);
    try {
        await sql`
    INSERT INTO invoices (customer_id, amount, status, date)
    VALUES (${customerId}, ${amountInCents}, ${status}, ${date})
  `;
    } catch (error) {
        return {
            message: 'Database Error: Failed to Create Invoice.',
        };
    }

    // next.js默认有缓存，这里可以强制重新请求数据库
    revalidatePath('/dashboard/invoices');
    // 重定向回去
    redirect('/dashboard/invoices');
}

// Use Zod to update the expected types
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, formData: FormData) {
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
    });

    const amountInCents = amount * 100;
    try {
        await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}
    `;
    } catch (error) {
        return { message: 'Database Error: Failed to Update Invoice.' };
    }

    revalidatePath('/dashboard/invoices');
    redirect('/dashboard/invoices');
}


export async function deleteInvoice(id: string) {
    throw new Error('Failed to Delete Invoice')
    //这个throw以后，后面的代码就不会执行了

    try {
        await sql`DELETE FROM invoices WHERE id = ${id}`;
        // 放在try里，保证即使出错也会跳转
        revalidatePath('/dashboard/invoices');
        return { message: 'Deleted Invoice.' };
    } catch (error) {
        return { message: 'Database Error: Failed to Delete Invoice.' };
    }
}