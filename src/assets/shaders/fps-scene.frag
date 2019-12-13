#version 300 es
precision highp float;

in vec3 vert_color;

out vec4 frag_color;

void main()
{
    frag_color = vec4(vert_color, 1.0f);
}