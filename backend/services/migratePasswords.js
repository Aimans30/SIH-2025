// migratePasswords.js - Script to migrate plain text passwords to bcrypt hashed passwords
const supabase = require('../config/supabase');
const bcrypt = require('bcrypt');

// Number of salt rounds for bcrypt
const SALT_ROUNDS = 10;

/**
 * Migrate all user passwords from plain text to bcrypt hashed
 */
async function migratePasswords() {
  try {
    console.log('Starting password migration...');
    
    // Get all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, password');
    
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    
    console.log(`Found ${users.length} users to migrate`);
    
    // Update each user's password
    for (const user of users) {
      try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
        
        // Update the user record
        const { error: updateError } = await supabase
          .from('users')
          .update({ password: hashedPassword })
          .eq('id', user.id);
        
        if (updateError) {
          console.error(`Error updating user ${user.id}:`, updateError);
        } else {
          console.log(`Updated password for user ${user.id}`);
        }
      } catch (err) {
        console.error(`Error processing user ${user.id}:`, err);
      }
    }
    
    console.log('Password migration completed');
  } catch (err) {
    console.error('Migration error:', err);
  }
}

// Run the migration
migratePasswords();