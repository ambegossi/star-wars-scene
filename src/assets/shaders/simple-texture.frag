#version 300 es
precision highp float;

// Uniforms
uniform sampler2D u_texture;

// Varyings
in vec2 v_texCoord;

out vec4 frag_color;

void main()
{
    // the function texture takes the texture itself and the texture coordinates
    frag_color = texture(u_texture, v_texCoord);
}