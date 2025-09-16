import snowflake from 'snowflake-sdk';

export async function executeSnowflakeQuery(query) {
    const connection = snowflake.createConnection({
        account: process.env.SNOWFLAKE_ACCOUNT,
        username: process.env.SNOWFLAKE_USER,
        password: process.env.SNOWFLAKE_PASSWORD,
        warehouse: process.env.SNOWFLAKE_WAREHOUSE,
        database: process.env.SNOWFLAKE_DATABASE,
        schema: process.env.SNOWFLAKE_SCHEMA
    });

    return new Promise((resolve, reject) => {
        connection.connect((err) => {
            if (err) {
                reject(err);
                return;
            }

            connection.execute({
                sqlText: query,
                complete: (err, stmt, rows) => {
                    connection.destroy();
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            });
        });
    });
}