precision mediump float;

varying vec2 vUvs;

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
	 	gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0) * uAlpha;
	}
	else
	{
	 	gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * uAlpha;
	}
}
