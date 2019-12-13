#version 300 es

uniform mat4 u_projection;
uniform mat4 u_model;
uniform mat4 u_view;

layout (location = 0) in vec3 pos;
layout (location = 1) in vec3 color;

out vec3 vert_color;

void main()
{    
    vert_color = color;
    vec4 position = u_projection * u_view * u_model * vec4(pos, 1);
    gl_Position = vec4(position.x, position.y, position.z, position.w);
}