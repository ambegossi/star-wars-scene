#version 300 es

// Uniforms
uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_view;

// Attributes
layout (location = 0) in vec3 a_pos;
layout (location = 1) in vec2 a_texCoord;
layout (location = 2) in vec3 a_color;

// Varyings
out vec2 v_texCoord;
out vec3 v_color;

void main()
{   
    v_texCoord = a_texCoord; // Pass texture coordinate to the fragment shader

    v_color = a_color;

    vec4 position = u_projection * u_view * u_model * vec4(a_pos, 1);
    // vec4 position = vec4(a_pos, 1);
    gl_Position = vec4(position.x, position.y, position.z, position.w);
}