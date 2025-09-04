// seedService.js - Service for seeding initial data
const supabase = require('../config/supabase');

/**
 * Seed service functions
 */
const seedService = {
  /**
   * Seed initial users for prototype
   */
  async seedUsers() {
    try {
      console.log('Checking if users need to be seeded...');
      
      // Check if users already exist
      const { data: existingUsers, error: countError } = await supabase
        .from('users')
        .select('count');
      
      if (countError) {
        throw countError;
      }
      
      if (!existingUsers || existingUsers.length === 0) {
        console.log('No users found, seeding initial users...');
        
        const users = [
          { 
            name: 'Regular User 1',
            phone: '1234567890', 
            password: 'user123', 
            role: 'user' 
          },
          { 
            name: 'Regular User 2',
            phone: '9876543210', 
            password: 'user456', 
            role: 'user' 
          },
          { 
            name: 'Roads Admin',
            phone: 'admin1', 
            password: 'admin123', 
            role: 'admin', 
            department: 'Roads' 
          },
          { 
            name: 'Sanitation Admin',
            phone: 'admin2', 
            password: 'admin456', 
            role: 'admin', 
            department: 'Sanitation' 
          },
          { 
            name: 'Roads Department Head',
            phone: 'head1', 
            password: 'head123', 
            role: 'head', 
            department: 'Roads' 
          },
          { 
            name: 'Sanitation Department Head',
            phone: 'head2', 
            password: 'head456', 
            role: 'head', 
            department: 'Sanitation' 
          }
        ];
        
        const { error: insertError } = await supabase
          .from('users')
          .insert(users);
        
        if (insertError) {
          throw insertError;
        }
        
        console.log('Users seeded successfully');
      } else {
        console.log('Users already exist, skipping seed');
      }
    } catch (error) {
      console.error('Error seeding users:', error);
    }
  },
  
  /**
   * Seed initial departments
   */
  async seedDepartments() {
    try {
      console.log('Checking if departments need to be seeded...');
      
      // Check if departments already exist
      const { data: existingDepartments, error: countError } = await supabase
        .from('departments')
        .select('count');
      
      if (countError) {
        throw countError;
      }
      
      if (!existingDepartments || existingDepartments.length === 0) {
        console.log('No departments found, seeding initial departments...');
        
        // First get the head users
        const { data: headUsers, error: headError } = await supabase
          .from('users')
          .select('id, department')
          .eq('role', 'head');
        
        if (headError) {
          throw headError;
        }
        
        // Create departments with their respective heads
        const departments = [
          { 
            name: 'Roads',
            head_id: headUsers.find(user => user.department === 'Roads')?.id
          },
          { 
            name: 'Sanitation',
            head_id: headUsers.find(user => user.department === 'Sanitation')?.id
          },
          { 
            name: 'Electricity',
            head_id: null
          },
          { 
            name: 'Water',
            head_id: null
          },
          { 
            name: 'General',
            head_id: null
          }
        ];
        
        const { error: insertError } = await supabase
          .from('departments')
          .insert(departments);
        
        if (insertError) {
          throw insertError;
        }
        
        console.log('Departments seeded successfully');
      } else {
        console.log('Departments already exist, skipping seed');
      }
    } catch (error) {
      console.error('Error seeding departments:', error);
    }
  },
  
  /**
   * Run all seed functions
   */
  async seedAll() {
    await this.seedUsers();
    await this.seedDepartments();
    console.log('All seed operations completed');
  }
};

module.exports = seedService;
