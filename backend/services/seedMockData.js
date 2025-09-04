// seedMockData.js - Script to insert mock data into Supabase tables
require('dotenv').config();
const supabase = require('../config/supabase');

/**
 * Mock data seeding functions
 */
const seedMockData = {
  /**
   * Seed users table with mock data
   */
  async seedUsers() {
    try {
      console.log('Seeding users table with mock data...');
      
      // First, let's check the structure of the users table
      const { data: tableInfo, error: tableError } = await supabase
        .from('users')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking users table structure:', tableError.message);
        return null;
      }
      
      console.log('Users table structure:', Object.keys(tableInfo[0] || {}));
      
      // Create users based on the exact table structure: id, phone, role, department, created_at, password, name
      const users = [
        { 
          name: 'Regular User 1',
          phone: '1234567890', 
          password: 'user123', 
          role: 'user',
          // Only include department if user has one
          department: null
        },
        { 
          name: 'Regular User 2',
          phone: '9876543210', 
          password: 'user456', 
          role: 'user',
          department: null
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
      
      // Try to insert without deleting first (to avoid RLS issues)
      const { data, error: insertError } = await supabase
        .from('users')
        .insert(users)
        .select();
      
      if (insertError) {
        console.error('Error seeding users:', insertError.message);
        return null;
      } else {
        console.log(`${data.length} users inserted successfully`);
        return data;
      }
    } catch (error) {
      console.error('Error in seedUsers:', error.message);
    }
  },
  
  /**
   * Seed departments table with mock data
   */
  async seedDepartments(users) {
    try {
      console.log('Seeding departments table with mock data...');
      
      // First, check if we can access the departments table
      const { data: tableInfo, error: tableError } = await supabase
        .from('departments')
        .select('*');
      
      if (tableError) {
        console.error('Error checking departments table structure:', tableError.message);
        console.log('Note: You may need to disable Row Level Security (RLS) for the departments table in Supabase');
        return null;
      }
      
      console.log('Departments table structure:', Object.keys(tableInfo[0] || {}));
      console.log(`Found ${tableInfo.length} existing departments`);
      
      // Find head users if we have users data
      const roadsHeadUser = users?.find(user => user.role === 'head' && user.department === 'Roads');
      const sanitationHeadUser = users?.find(user => user.role === 'head' && user.department === 'Sanitation');
      
      // Create departments based on the exact table structure: id, name, head_id
      const departmentsToCreate = [
        { 
          name: 'Roads',
          head_id: roadsHeadUser?.id || null
        },
        { 
          name: 'Sanitation',
          head_id: sanitationHeadUser?.id || null
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
      
      // Filter out departments that already exist
      const existingDepartmentNames = tableInfo.map(dept => dept.name);
      const newDepartments = departmentsToCreate.filter(dept => !existingDepartmentNames.includes(dept.name));
      
      if (newDepartments.length === 0) {
        console.log('All departments already exist, skipping insertion');
        return tableInfo; // Return existing departments
      }
      
      console.log(`Inserting ${newDepartments.length} new departments...`);
      
      // Try to insert only new departments
      const { data, error: insertError } = await supabase
        .from('departments')
        .insert(newDepartments)
        .select();
      
      if (insertError) {
        console.error('Error seeding departments:', insertError.message);
        console.log('To fix this issue:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Authentication > Policies');
        console.log('3. Temporarily disable RLS for the departments table or add appropriate policies');
        return tableInfo; // Return existing departments even if insert fails
      } else {
        console.log(`${data.length} departments inserted successfully`);
        return [...tableInfo, ...data]; // Return both existing and newly inserted departments
      }
    } catch (error) {
      console.error('Error in seedDepartments:', error.message);
      return null;
    }
  },
  
  /**
   * Seed complaints table with mock data
   */
  async seedComplaints(users) {
    try {
      console.log('Seeding complaints table with mock data...');
      
      if (!users || users.length === 0) {
        const { data: fetchedUsers, error: fetchError } = await supabase
          .from('users')
          .select('*');
        
        if (fetchError) {
          console.error('Error fetching users:', fetchError.message);
          return;
        }
        
        users = fetchedUsers;
      }
      
      // Find regular users for complaints
      const regularUsers = users.filter(user => user.role === 'user');
      
      if (regularUsers.length === 0) {
        console.error('No regular users found to associate with complaints');
        return;
      }
      
      // Check the actual table structure
      const { data: tableInfo, error: tableError } = await supabase
        .from('complaints')
        .select('*')
        .limit(1);
      
      if (tableError) {
        console.error('Error checking complaints table structure:', tableError.message);
        console.log('Note: You may need to disable Row Level Security (RLS) for the complaints table in Supabase');
        return;
      }
      
      console.log('Complaints table structure:', Object.keys(tableInfo[0] || {}));
      
      // Create complaints based on the exact table structure: id, status, department, escalated, created_at, updated_at, location_address
      const complaints = [
        {
          user_id: regularUsers[0].id,
          status: 'Submitted',
          department: 'Roads',
          escalated: false,
          location_address: '123 Main Street, Delhi',
          description: 'Large pothole in the middle of the road causing traffic issues',
          type: 'Broken Road',
          location_lat: 28.6139,
          location_lng: 77.2090
        },
        {
          user_id: regularUsers[0].id,
          status: 'In Progress',
          department: 'Sanitation',
          escalated: false,
          location_address: '456 Park Avenue, Delhi',
          description: 'Garbage not collected for the past week',
          type: 'Garbage Collection',
          location_lat: 28.6129,
          location_lng: 77.2295
        },
        {
          user_id: regularUsers[1]?.id || regularUsers[0].id,
          status: 'Resolved',
          department: 'Electricity',
          escalated: true,
          location_address: '789 Avenue Road, Delhi',
          description: 'Street light not working for the past 3 days',
          type: 'Street Light',
          location_lat: 28.6329,
          location_lng: 77.2195
        }
      ];
      
      // Try to insert without deleting first (to avoid RLS issues)
      const { data, error: insertError } = await supabase
        .from('complaints')
        .insert(complaints)
        .select();
      
      if (insertError) {
        console.error('Error seeding complaints:', insertError.message);
        console.log('To fix this issue:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Navigate to Authentication > Policies');
        console.log('3. Temporarily disable RLS for the complaints table or add appropriate policies');
        return null;
      } else {
        console.log(`${data.length} complaints inserted successfully`);
        return data;
      }
    } catch (error) {
      console.error('Error in seedComplaints:', error.message);
      return null;
    }
  },
  
  /**
   * Run all seed functions
   */
  async seedAll() {
    try {
      console.log('Starting mock data seeding process...');
      const users = await this.seedUsers();
      await this.seedDepartments(users);
      await this.seedComplaints(users);
      console.log('Mock data seeding completed successfully');
    } catch (error) {
      console.error('Error in seedAll:', error.message);
    }
  }
};

// Execute seeding if this script is run directly
if (require.main === module) {
  seedMockData.seedAll()
    .then(() => {
      console.log('Seeding script completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding script failed:', error);
      process.exit(1);
    });
}

module.exports = seedMockData;
