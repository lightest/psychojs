#version 300 es
precision mediump float;

in vec2 vUvs;
out vec4 shaderOut;

#define M_PI 3.14159265358979
uniform float uFreq;
uniform float uAlpha;
uniform float uDevicePixelRatio;
uniform float uMod;
uniform float uThickness;

void main () {
	float stripes = uFreq * vUvs.x;

	if (mod(stripes, uMod) < uThickness)
	{
	 	shaderOut = vec4(1.0, 1.0, 1.0, 1.0) * uAlpha;
	}
	else
	{
	 	shaderOut = vec4(0.0, 0.0, 0.0, 1.0) * uAlpha;
	}
}
