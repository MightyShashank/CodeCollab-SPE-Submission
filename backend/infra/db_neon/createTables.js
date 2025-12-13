const { getClient, pool } = require('./connectDB');

async function createTables() {
  const client = await getClient();
  try {
    // USERS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        user_id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(100),
        role VARCHAR(20) DEFAULT 'user',
        
        -- New fields from Mongoose schema --
        is_verified BOOLEAN DEFAULT FALSE,
        verification_token TEXT,
        verification_token_expires_at TIMESTAMP,
        reset_password_token TEXT,
        reset_password_token_expires_at TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        -- Original timestamp fields --
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      );
    `);

    // PROBLEMS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS problems (
        problem_id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description_md TEXT,
        main_required BOOLEAN DEFAULT TRUE,
        boilerplate_md TEXT,
        testcases_object_link TEXT,
        time_limit_ms INT DEFAULT 1000,
        memory_limit_kb INT DEFAULT 65536,
        visibility VARCHAR(10) DEFAULT 'public',
        solved_by_total INT DEFAULT 0,
        difficulty VARCHAR(10) CHECK (difficulty IN ('Easy','Medium','Hard')),
        visible_testcases JSONB,
        actual_solution TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_problems_difficulty ON problems(difficulty);`);

    // LANGUAGES MAPPING
    await client.query(`
      CREATE TABLE IF NOT EXISTS languages_id_name_mapping (
        language_id SERIAL PRIMARY KEY,
        language_name VARCHAR(50) UNIQUE NOT NULL,
        boilerplate_generator_script TEXT
      );
    `);

    // PROBLEM-LANGUAGES TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS problem_languages (
        problem_language_id SERIAL PRIMARY KEY,
        problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
        language_id INT REFERENCES languages_id_name_mapping(language_id),
        function_code TEXT,
        main_code TEXT
      );
    `);

    // SUBMISSIONS TABLE
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        submission_id SERIAL PRIMARY KEY,
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        problem_id INT REFERENCES problems(problem_id) ON DELETE CASCADE,
        code TEXT NOT NULL,
        testcases_result_link TEXT,
        time_taken_ms INT,
        memory_taken_kb INT,
        verdict VARCHAR(20) CHECK (verdict IN ('Accepted','Rejected')) DEFAULT 'Rejected',
        status TEXT,
        language_id INT REFERENCES languages_id_name_mapping(language_id),
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        submission_uuid TEXT UNIQUE
      );
    `);

    await client.query(`CREATE INDEX IF NOT EXISTS idx_submissions_problem_user ON submissions(problem_id, user_id);`);

    // SUBMISSION LOGS
    await client.query(`
      CREATE TABLE IF NOT EXISTS submission_logs (
        log_id SERIAL PRIMARY KEY,
        submission_id INT REFERENCES submissions(submission_id) ON DELETE CASCADE,
        stdout TEXT,
        stderr TEXT,
        exit_code INT,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("All tables created successfully!");
  } catch (err) {
    console.error("Error creating tables:", err);
  } finally {
    client.release();
    pool.end();
  }
}

createTables();
