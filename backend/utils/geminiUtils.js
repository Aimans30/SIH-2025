// geminiUtils.js - Utility functions for Google Gemini API integration
const axios = require('axios');

// Gemini model and URL configuration
const GEMINI_MODEL = 'gemini-2.5-flash';
const GEN_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

/**
 * Validates an image against a complaint type and description using Google Gemini API
 * @param {Buffer} imageBuffer - The image buffer to validate
 * @param {string} complaintType - The type of complaint
 * @param {string} description - The description of the complaint
 * @returns {Promise<Object>} - Validation result with isValid and feedback
 */
async function validateComplaintImage(imageBuffer, complaintType, description) {
  console.log('🔍 Starting image validation with Gemini 2.5 Flash API');
  console.log(`📋 Complaint Type: ${complaintType}`);
  console.log(`📝 Description: ${description.substring(0, 50)}${description.length > 50 ? '...' : ''}`);
  console.log(`🖼️ Image Buffer Size: ${imageBuffer.length} bytes`);
  console.log(`🤖 Using model: ${GEMINI_MODEL}`);
  
  try {
    // Initialize the Gemini API with your API key
    const API_KEY = process.env.GEMINI_API_KEY;
    console.log(`🔑 API Key Present: ${!!API_KEY}`);
    if (!API_KEY) {
      console.error('❌ GEMINI_API_KEY is not defined in environment variables');
      throw new Error('GEMINI_API_KEY is not defined in environment variables');
    }

    // Convert image buffer to base64
    const base64Image = imageBuffer.toString('base64');
    console.log(`🔄 Converted image to base64 string (${base64Image.length} chars)`); 
    
    // Prepare the prompt for Gemini
    const prompt = `You are a STRICT AI validator for civic complaint images. Your job is to ensure PERFECT alignment between complaint type, description, and image.

COMPLAINT DETAILS:
- Type: ${complaintType}
- Description: ${description}

STRICT VALIDATION RULES:
1. The image MUST clearly show the EXACT issue described in the complaint type
2. The image MUST match the specific details mentioned in the description
3. ALL THREE elements (type, description, image) must be PERFECTLY aligned
4. If ANY element doesn't match, mark as INVALID

VALIDATION CRITERIA:
✅ VALID only if:
- Image clearly shows the reported issue type
- Image matches ALL details in the description
- No ambiguity about what the image shows
- The issue is clearly visible and documented

❌ INVALID if:
- Image doesn't match the complaint type
- Image doesn't show the described issue
- Image is unclear, blurry, or irrelevant
- Wrong type of issue shown
- Description doesn't match what's visible

RESPONSE FORMAT (JSON only):
{
  "isValid": boolean,
  "feedback": "PROVIDE A COMPLETE, DETAILED EXPLANATION with specific observations about the image and why it does or doesn't match the complaint. DO NOT TRUNCATE YOUR RESPONSE.",
  "suggestedAction": "Specific action for user"
}

SPECIFIC EXAMPLES:
- "Broken Road" + "pothole on main street" → Image MUST show actual pothole on road
- "Garbage Collection" + "overflowing bin" → Image MUST show overflowing garbage bin
- "Street Light" + "broken light pole" → Image MUST show damaged/broken street light
- "Water Supply" + "leaking pipe" → Image MUST show actual water leak from pipe

IMPORTANT: 
- If VALID: suggestedAction = "Proceed with the complaint"
- If INVALID: suggestedAction = "Please check if your type, description and image are correct"
- PROVIDE COMPLETE FEEDBACK: Explain exactly what's in the image and why it does or doesn't match
- BE THOROUGH: DO NOT truncate your feedback, include ALL relevant details
- FULL DESCRIPTIONS: Describe the image content completely and explain your reasoning fully

BE EXTREMELY STRICT. Only approve if there's PERFECT alignment between all three elements.`;
    
    console.log('📤 Sending prompt to Gemini API:');
    console.log('-----------------------------------');
    console.log(prompt);
    console.log('-----------------------------------');

    // Prepare the request payload for Gemini 2.5 Flash API
    const payload = {
      contents: [
        {
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: "image/jpeg", // Adjust based on actual image type if needed
                data: base64Image
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1, // Lower temperature for more consistent, strict responses
        topP: 0.7,        // Lower topP for more focused responses
        topK: 20,         // Lower topK for more deterministic responses
        maxOutputTokens: 4096 // Increased tokens for complete responses
      }
    };

    // Generate content with the image and prompt using axios
    console.log('📢 Calling Gemini 2.5 Flash API...');
    console.log('💬 API URL:', GEN_API_URL);
    const startTime = Date.now();
    
    const response = await axios.post(
      `${GEN_API_URL}?key=${API_KEY}`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    const endTime = Date.now();
    console.log(`⏱️ Gemini API response time: ${endTime - startTime}ms`);
    
    // Extract text from response
    const text = response.data.candidates[0].content.parts[0].text;
    
    console.log('📥 Received response from Gemini API:');
    console.log('-----------------------------------');
    // Log a preview in the console but don't truncate the actual text
    console.log(text.length > 500 ? text.substring(0, 500) + '... (truncated in log only)' : text);
    console.log('-----------------------------------');
    console.log('📏 Full response length:', text.length, 'characters');
    
    // Parse the JSON response
    try {
      console.log('🔎 Attempting to parse response as JSON...');
      const validationResult = JSON.parse(text);
      console.log('✅ Successfully parsed JSON response:');
      console.log(JSON.stringify(validationResult, null, 2));
      return validationResult;
    } catch (parseError) {
      console.error('❌ Error parsing Gemini response as JSON:', parseError);
      console.log('🔧 Falling back to text analysis...');
      
      // If parsing fails, try to extract JSON from the text response
      const jsonMatch = text.match(/\{[\s\S]*?\}/); // Match JSON object
      let isValid = false;
      let extractedFeedback = '';
      let extractedSuggestedAction = '';
      
      if (jsonMatch) {
        try {
          // Try to parse the JSON from the text
          const extractedJson = JSON.parse(jsonMatch[0]);
          console.log('🔍 Extracted JSON from text:', extractedJson);
          
          // Use the isValid value from the extracted JSON
          isValid = !!extractedJson.isValid;
          extractedFeedback = extractedJson.feedback || '';
          extractedSuggestedAction = extractedJson.suggestedAction || '';
          
          console.log(`🔍 Extracted isValid from JSON: ${isValid}`);
        } catch (jsonError) {
          console.error('❌ Error parsing extracted JSON:', jsonError);
          // Fall back to text analysis if JSON parsing fails
          isValid = text.toLowerCase().includes('valid') && !text.toLowerCase().includes('not valid') && !text.toLowerCase().includes('invalid');
          console.log(`🔍 Fallback text analysis result - isValid: ${isValid}`);
        }
      } else {
        // No JSON found, use text analysis
        isValid = text.toLowerCase().includes('valid') && !text.toLowerCase().includes('not valid') && !text.toLowerCase().includes('invalid');
        console.log(`🔍 Text analysis result - isValid: ${isValid}`);
      }
      
      // Create a more informative fallback result
      let feedback = '';
      let suggestedAction = '';
      
      // Use extracted feedback and suggestedAction if available
      if (extractedFeedback) {
        feedback = extractedFeedback;
        console.log('💬 Using extracted feedback from JSON');
      } else {
        if (isValid) {
          feedback = 'The image appears to match your complaint type and description. ' + text;
        } else {
          feedback = 'The image does not appear to match your complaint type or description. ' +
                    'Please ensure your image clearly shows the specific issue mentioned in your complaint. ' +
                    text;
        }
        console.log('💬 Generated new feedback based on text analysis');
      }
      
      // Use extracted suggestedAction if available
      if (extractedSuggestedAction) {
        suggestedAction = extractedSuggestedAction;
        console.log('💬 Using extracted suggestedAction from JSON');
      } else {
        suggestedAction = isValid ? 'Proceed with the complaint' : 'Please check if your type, description and image are correct';
        console.log('💬 Generated new suggestedAction based on isValid');
      }
      
      const fallbackResult = {
        isValid,
        feedback,
        suggestedAction
      };
      
      console.log('🔧 Created fallback validation result:', fallbackResult);
      return fallbackResult;
    }
  } catch (error) {
    console.error('❌ Error validating image with Gemini:', error);
    console.log('🚨 Error details:', error.message);
    console.log('🔄 Stack trace:', error.stack);
    
    // Return a default response in case of API errors
    const defaultResponse = {
      isValid: false, // Default to false for strict validation
      feedback: 'We encountered a technical issue while analyzing your image. This is not related to your image content, but rather a system limitation.',
      suggestedAction: 'You can try again with the same image or upload a different one that clearly shows the issue'
    };
    
    console.log('⚠️ Returning default validation response:', defaultResponse);
    return defaultResponse;
  }
}

module.exports = {
  validateComplaintImage
};
