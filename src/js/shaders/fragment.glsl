varying float vNoise;

void main()	{
    vec3 color1 = vec3(1. , 0., 0.);
    vec3 color2 = vec3(1. , 1., 1.);
    vec3 finalColor = mix(color1, color2, 0.5 * (vNoise + 1.)); // 0.5 * (vNoise + 1.) to normalise the value return by the noise function

    gl_FragColor = vec4(finalColor, 1.);
}