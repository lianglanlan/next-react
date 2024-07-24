import bcrypt from 'bcrypt';
import { db } from '@vercel/postgres';
import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const client = await db.connect();

async function seedUsers() {
  /* 在数据库中创建一个“uuid-ossp”扩展，这个扩展提供了生成UUID（Universally Unique Identifier）函数
    CREATE EXTENSION：这是一个 PostgreSQL 命令，用于创建一个扩展。
    IF NOT EXISTS：可选的条件子句，用于在执行某些操作之前检查某个对象（如表、数据库、索引、视图、扩展等）是否已经存在。如果对象不存在，则执行操作；如果对象已经存在，则跳过操作。这有助于避免在创建对象时出现重复创建的错误。
    "uuid-ossp"：这是扩展的名称。uuid-ossp 扩展提供了生成 UUID 的函数。
  */
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
  
  /**
   * CREATE TABLE 语句用于创建数据库中的表。表由行和列组成，每个表都必须有个表名，当前表名是users
   * id UUID DEFAULT uuid_generate_v4() PRIMARY KEY: 
   *    id 列名
   *    UUID 数据类型，表示该列存储UUID值
   *    DEFAULT 后面跟默认值，表示如果插入数据时没有提供该列的值，将使用后面的默认值。
   *    uuid_generate_v4()是uuid-ossp提供函数，用于生产随机的UUID
   *    PRIMARY KEY：主键约束，表示该列是表的主键，必须唯一且不能为空。
   */

  /**
   * name VARCHAR(255) NOT NULL,
   *    name: 列名（第一个都是列名）
   *    VARCHAR(255)：数据类型，表示该列存储可变长度的字符串，最大长度为 255 个字符。
   *    NOT NULL：约束，表示该列不能为空，即在插入或更新数据时，必须为该列提供一个非空值。
   */

  /**
   * email TEXT NOT NULL UNIQUE,
   *    TEXT: 数据类型，表示该列存储可变长度的字符串。TEXT 类型通常用于存储较长的文本数据。
   *    UNIQUE：约束，表示该列的值必须唯一，即在表中不能有重复的值。
   */
  await client.sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    );
  `;

  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      /**
       * bcrypt.hash(user.password, 10) 使用 bcrypt 库对用户密码进行哈希处理的一个常见方法
       */
      const hashedPassword = await bcrypt.hash(user.password, 10);
      /**
       * INSERT INTO 将用户数据插入到users表里
       */
      /**
       * ON CONFLICT (id) DO NOTHING;
       *    ON CONFLICT：这是一个子句，用于指定在插入数据时发生冲突时的处理方式。
       *    (id)：这是冲突检测的列名。在这个例子中，id 列是用于检测冲突的列。
       *    DO NOTHING：这是冲突处理的动作，表示在发生冲突时不执行任何操作。
       */
      return client.sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING;
      `;
    }),
  );

  return insertedUsers;
}

async function seedInvoices() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS invoices (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    );
  `;

  const insertedInvoices = await Promise.all(
    invoices.map(
      (invoice) => client.sql`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedInvoices;
}

// 删除重复的数据(invoices数据不知道怎么多写入了一遍)
async function deleteInvoicesCopy() {
  await client.sql`
    WITH CTE AS (
      SELECT 
          id,
          customer_id,
          amount,
          status,
          date,
          ROW_NUMBER() OVER (PARTITION BY customer_id, amount, date ORDER BY id) AS row_num
      FROM invoices
    )
    DELETE FROM invoices
    WHERE id IN (
        SELECT id
        FROM CTE
        WHERE row_num > 1
    );
  `
}

async function seedCustomers() {
  await client.sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

  await client.sql`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `;

  const insertedCustomers = await Promise.all(
    customers.map(
      (customer) => client.sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING;
      `,
    ),
  );

  return insertedCustomers;
}

async function seedRevenue() {
  await client.sql`
    CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    );
  `;

  const insertedRevenue = await Promise.all(
    revenue.map(
      (rev) => client.sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING;
      `,
    ),
  );

  return insertedRevenue;
}

export async function GET() {
  // return Response.json({
  //   message:
  //     'Uncomment this file and remove this line. You can delete this file when you are finished.',
  // });
  try {
    await client.sql`BEGIN`;
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    await deleteInvoicesCopy();
    await client.sql`COMMIT`;

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    await client.sql`ROLLBACK`;
    return Response.json({ error }, { status: 500 });
  }
}
