/**
 * Grating Stimulus.
 *
 * @author Alain Pitiot, Nikita Agafonov
 * @version 2021.2.0
 * @copyright (c) 2017-2020 Ilixa Ltd. (http://ilixa.com) (c) 2020-2022 Open Science Tools Ltd. (https://opensciencetools.org)
 * @license Distributed under the terms of the MIT License
 */

import * as PIXI from "pixi.js-legacy";
import { Color } from "../util/Color.js";
import { ColorMixin } from "../util/ColorMixin.js";
import { to_pixiPoint } from "../util/Pixi.js";
import * as util from "../util/Util.js";
import { VisualStim } from "./VisualStim.js";
import defaultQuadVert from "./shaders/defaultQuad.vert";
import sinShader from "./shaders/sinShader.frag";
import sqrShader from "./shaders/sqrShader.frag";
import sawShader from "./shaders/sawShader.frag";
import triShader from "./shaders/triShader.frag";
import sinXsinShader from "./shaders/sinXsinShader.frag";
import sqrXsqrShader from "./shaders/sqrXsqrShader.frag";
import circleShader from "./shaders/circleShader.frag";
import gaussShader from "./shaders/gaussShader.frag";
import crossShader from "./shaders/crossShader.frag";
import radRampShader from "./shaders/radRampShader.frag";
import raisedCosShader from "./shaders/raisedCosShader.frag";

/**
 * Grating Stimulus.
 *
 * @name module:visual.GratingStim
 * @class
 * @extends VisualStim
 * @mixes ColorMixin
 * @param {Object} options
 * @param {String} options.name - the name used when logging messages from this stimulus
 * @param {Window} options.win - the associated Window
 * @param {String | HTMLImageElement} [options.tex="sin"] - the name of the predefined grating texture or image resource or the HTMLImageElement corresponding to the texture
 * @param {String | HTMLImageElement} [options.mask] - the name of the mask resource or HTMLImageElement corresponding to the mask
 * @param {String} [options.units= "norm"] - the units of the stimulus (e.g. for size, position, vertices)
 * @param {number} [options.sf=1.0] - spatial frequency of the function used in grating stimulus
 * @param {number} [options.phase=1.0] - phase of the function used in grating stimulus
 * @param {Array.<number>} [options.pos= [0, 0]] - the position of the center of the stimulus
 * @param {number} [options.ori= 0.0] - the orientation (in degrees)
 * @param {number} [options.size] - the size of the rendered image (DEFAULT_STIM_SIZE_PX will be used if size is not specified)
 * @param {Color} [options.color= "white"] the background color
 * @param {number} [options.opacity= 1.0] - the opacity
 * @param {number} [options.contrast= 1.0] - the contrast
 * @param {number} [options.depth= 0] - the depth (i.e. the z order)
 * @param {boolean} [options.interpolate= false] - whether or not the image is interpolated. NOT IMPLEMENTED YET.
 * @param {String} [options.blendmode= 'avg'] - blend mode of the stimulus, determines how the stimulus is blended with the background. NOT IMPLEMENTED YET.
 * @param {boolean} [options.autoDraw= false] - whether or not the stimulus should be automatically drawn on every frame flip
 * @param {boolean} [options.autoLog= false] - whether or not to log
 */

export class GratingStim extends util.mix(VisualStim).with(ColorMixin)
{
	/**
	 * An object that keeps shaders source code and default uniform values for them.
	 * Shader source code is later used for construction of shader programs to create respective visual stimuli.
	 * @name module:visual.GratingStim.#SHADERS
	 * @type {Object}
	 * @property {Object} sin - Creates 2d sine wave image as if 1d sine graph was extended across Z axis and observed from above.
	 * {@link https://en.wikipedia.org/wiki/Sine_wave}
	 * @property {String} sin.shader - shader source code for the sine wave stimuli
	 * @property {Object} sin.uniforms - default uniforms for sine wave shader
	 * @property {float} sin.uniforms.uFreq=1.0 - frequency of sine wave.
	 * @property {float} sin.uniforms.uPhase=0.0 - phase of sine wave.
	 *
	 * @property {Object} sqr - Creates 2d square wave image as if 1d square graph was extended across Z axis and observed from above.
	 * {@link https://en.wikipedia.org/wiki/Square_wave}
	 * @property {String} sqr.shader - shader source code for the square wave stimuli
	 * @property {Object} sqr.uniforms - default uniforms for square wave shader
	 * @property {float} sqr.uniforms.uFreq=1.0 - frequency of square wave.
	 * @property {float} sqr.uniforms.uPhase=0.0 - phase of square wave.
	 *
	 * @property {Object} saw - Creates 2d sawtooth wave image as if 1d sawtooth graph was extended across Z axis and observed from above.
	 * {@link https://en.wikipedia.org/wiki/Sawtooth_wave}
	 * @property {String} saw.shader - shader source code for the sawtooth wave stimuli
	 * @property {Object} saw.uniforms - default uniforms for sawtooth wave shader
	 * @property {float} saw.uniforms.uFreq=1.0 - frequency of sawtooth wave.
	 * @property {float} saw.uniforms.uPhase=0.0 - phase of sawtooth wave.
	 *
	 * @property {Object} tri - Creates 2d triangle wave image as if 1d triangle graph was extended across Z axis and observed from above.
	 * {@link https://en.wikipedia.org/wiki/Triangle_wave}
	 * @property {String} tri.shader - shader source code for the triangle wave stimuli
	 * @property {Object} tri.uniforms - default uniforms for triangle wave shader
	 * @property {float} tri.uniforms.uFreq=1.0 - frequency of triangle wave.
	 * @property {float} tri.uniforms.uPhase=0.0 - phase of triangle wave.
	 * @property {float} tri.uniforms.uPeriod=1.0 - period of triangle wave.
	 *
	 * @property {Object} sinXsin - Creates an image of two 2d sine waves multiplied with each other.
	 * {@link https://en.wikipedia.org/wiki/Sine_wave}
	 * @property {String} sinXsin.shader - shader source code for the two multiplied sine waves stimuli
	 * @property {Object} sinXsin.uniforms - default uniforms for shader
	 * @property {float} sinXsin.uniforms.uFreq=1.0 - frequency of sine wave (both of them).
	 * @property {float} sinXsin.uniforms.uPhase=0.0 - phase of sine wave (both of them).
	 *
	 * @property {Object} sqrXsqr - Creates an image of two 2d square waves multiplied with each other.
	 * {@link https://en.wikipedia.org/wiki/Square_wave}
	 * @property {String} sqrXsqr.shader - shader source code for the two multiplied sine waves stimuli
	 * @property {Object} sqrXsqr.uniforms - default uniforms for shader
	 * @property {float} sqrXsqr.uniforms.uFreq=1.0 - frequency of sine wave (both of them).
	 * @property {float} sqrXsqr.uniforms.uPhase=0.0 - phase of sine wave (both of them).
	 *
	 * @property {Object} circle - Creates a filled circle shape with sharp edges.
	 * @property {String} circle.shader - shader source code for filled circle.
	 * @property {Object} circle.uniforms - default uniforms for shader.
	 * @property {float} circle.uniforms.uRadius=1.0 - Radius of the circle. Ranges [0.0, 1.0], where 0.0 is circle so tiny it results in empty stim
	 * and 1.0 is circle that spans from edge to edge of the stim.
	 *
	 * @property {Object} gauss - Creates a 2d Gaussian image as if 1d Gaussian graph was rotated arount Y axis and observed from above.
	 * {@link https://en.wikipedia.org/wiki/Gaussian_function}
	 * @property {String} gauss.shader - shader source code for Gaussian shader
	 * @property {Object} gauss.uniforms - default uniforms for shader
	 * @property {float} gauss.uniforms.uA=1.0 - A constant for gaussian formula (see link).
	 * @property {float} gauss.uniforms.uB=0.0 - B constant for gaussian formula (see link).
	 * @property {float} gauss.uniforms.uC=0.16 - C constant for gaussian formula (see link).
	 *
	 * @property {Object} cross - Creates a filled cross shape with sharp edges.
	 * @property {String} cross.shader - shader source code for cross shader
	 * @property {Object} cross.uniforms - default uniforms for shader
	 * @property {float} cross.uniforms.uThickness=0.2 - Thickness of the cross. Ranges [0.0, 1.0], where 0.0 thickness makes a cross so thin it becomes
	 * invisible and results in an empty stim and 1.0 makes it so thick it fills the entire stim.
	 *
	 * @property {Object} radRamp - Creates 2d radial ramp image.
	 * @property {String} radRamp.shader - shader source code for radial ramp shader
	 * @property {Object} radRamp.uniforms - default uniforms for shader
	 * @property {float} radRamp.uniforms.uSqueeze=1.0 - coefficient that helps to modify size of the ramp. Ranges [0.0, Infinity], where 0.0 results in ramp being so large
	 * it fills the entire stim and Infinity makes it so tiny it's invisible.
	 *
	 * @property {Object} raisedCos - Creates 2d raised-cosine image as if 1d raised-cosine graph was rotated around Y axis and observed from above.
	 * {@link https://en.wikipedia.org/wiki/Raised-cosine_filter}
	 * @property {String} raisedCos.shader - shader source code for raised-cosine shader
	 * @property {Object} raisedCos.uniforms - default uniforms for shader
	 * @property {float} raisedCos.uniforms.uBeta=0.25 - roll-off factor (see link).
	 * @property {float} raisedCos.uniforms.uPeriod=0.625 - reciprocal of the symbol-rate (see link).
	 */
	static #SHADERS = {
		sin: {
			shader: sinShader,
			uniforms: {
				uFreq: 1.0,
				uPhase: 0.0
			}
		},
		sqr: {
			shader: sqrShader,
			uniforms: {
				uFreq: 1.0,
				uPhase: 0.0
			}
		},
		saw: {
			shader: sawShader,
			uniforms: {
				uFreq: 1.0,
				uPhase: 0.0
			}
		},
		tri: {
			shader: triShader,
			uniforms: {
				uFreq: 1.0,
				uPhase: 0.0,
				uPeriod: 1.0
			}
		},
		sinXsin: {
			shader: sinXsinShader,
			uniforms: {
				uFreq: 1.0,
				uPhase: 0.0
			}
		},
		sqrXsqr: {
			shader: sqrXsqrShader,
			uniforms: {
				uFreq: 1.0,
				uPhase: 0.0
			}
		},
		circle: {
			shader: circleShader,
			uniforms: {
				uRadius: 1.0
			}
		},
		gauss: {
			shader: gaussShader,
			uniforms: {
				uA: 1.0,
				uB: 0.0,
				uC: 0.16
			}
		},
		cross: {
			shader: crossShader,
			uniforms: {
				uThickness: 0.2
			}
		},
		radRamp: {
			shader: radRampShader,
			uniforms: {
				uSqueeze: 1.0
			}
		},
		raisedCos: {
			shader: raisedCosShader,
			uniforms: {
				uBeta: 0.25,
				uPeriod: 0.625
			}
		}
	};

	/**
	 * Default size of the Grating Stimuli in pixels.
	 * @name module:visual.GratingStim.#DEFAULT_STIM_SIZE_PX
	 * @type {Array}
	 * @default [256, 256]
	 */
	static #DEFAULT_STIM_SIZE_PX = [256, 256]; // in pixels

	constructor({
		name,
		tex = "sin",
		win,
		mask,
		pos,
		units,
		sf = 1.0,
		ori,
		phase,
		size,
		color,
		colorSpace,
		opacity,
		contrast,
		depth,
		interpolate,
		blendmode,
		autoDraw,
		autoLog,
		maskParams
	} = {})
	{
		super({ name, win, units, ori, opacity, depth, pos, size, autoDraw, autoLog });

		this._addAttribute(
			"tex",
			tex,
		);
		this._addAttribute(
			"mask",
			mask,
		);
		this._addAttribute(
			"SF",
			sf,
			GratingStim.#SHADERS[tex] ? GratingStim.#SHADERS[tex].uniforms.uFreq || 1.0 : 1.0
		);
		this._addAttribute(
			"phase",
			phase,
			GratingStim.#SHADERS[tex] ? GratingStim.#SHADERS[tex].uniforms.uPhase || 0.0 : 0.0
		);
		this._addAttribute(
			"color",
			color,
			"white",
			this._onChange(true, false),
		);
		this._addAttribute(
			"contrast",
			contrast,
			1.0,
			this._onChange(true, false),
		);
		this._addAttribute(
			"interpolate",
			interpolate,
			false,
			this._onChange(true, false),
		);

		// estimate the bounding box:
		this._estimateBoundingBox();

		if (this._autoLog)
		{
			this._psychoJS.experimentLogger.exp(`Created ${this.name} = ${this.toString()}`);
		}

		if (!Array.isArray(this.size) || this.size.length === 0) {
			this.size = util.to_unit(GratingStim.#DEFAULT_STIM_SIZE_PX, "pix", this.win, this.units);
		}
		this._size_px = util.to_px(this.size, this.units, this.win);
	}

	/**
	 * Setter for the tex attribute.
	 *
	 * @name module:visual.GratingStim#setTex
	 * @public
	 * @param {HTMLImageElement | string} tex - the name of built in shader function or name of the image resource or HTMLImageElement corresponding to the image
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setTex(tex, log = false)
	{
		const response = {
			origin: "GratingStim.setTex",
			context: "when setting the tex of GratingStim: " + this._name,
		};

		try
		{
			let hasChanged = false;

			// tex is undefined: that's fine but we raise a warning in case this is a symptom of an actual problem
			if (typeof tex === "undefined")
			{
				this.psychoJS.logger.warn("setting the tex of GratingStim: " + this._name + " with argument: undefined.");
				this.psychoJS.logger.debug("set the tex of GratingStim: " + this._name + " as: undefined");
			}
			else if (GratingStim.#SHADERS[tex] !== undefined)
			{
				// tex is a string and it is one of predefined functions available in shaders
				this.psychoJS.logger.debug("the tex is one of predefined functions. Set the tex of GratingStim: " + this._name + " as: " + tex);
				const curFuncName = this.getTex();
				hasChanged = curFuncName ? curFuncName !== tex : true;
			}
			else
			{
				// tex is a string: it should be the name of a resource, which we load
				if (typeof tex === "string")
				{
					tex = this.psychoJS.serverManager.getResource(tex);
				}

				// tex should now be an actual HTMLImageElement: we raise an error if it is not
				if (!(tex instanceof HTMLImageElement))
				{
					throw "the argument: " + tex.toString() + " is not an image\" }";
				}

				this.psychoJS.logger.debug("set the tex of GratingStim: " + this._name + " as: src= " + tex.src + ", size= " + tex.width + "x" + tex.height);
				const existingImage = this.getTex();
				hasChanged = existingImage ? existingImage.src !== tex.src : true;
			}

			this._setAttribute("tex", tex, log);

			if (hasChanged)
			{
				this._onChange(true, true)();
			}
		}
		catch (error)
		{
			throw Object.assign(response, { error });
		}
	}

	/**
	 * Setter for the mask attribute.
	 *
	 * @name module:visual.GratingStim#setMask
	 * @public
	 * @param {HTMLImageElement | string} mask - the name of the mask resource or HTMLImageElement corresponding to the mask
	 * @param {boolean} [log= false] - whether of not to log
	 */
	setMask(mask, log = false)
	{
		const response = {
			origin: "GratingStim.setMask",
			context: "when setting the mask of GratingStim: " + this._name,
		};

		try
		{
			// mask is undefined: that's fine but we raise a warning in case this is a sympton of an actual problem
			if (typeof mask === "undefined")
			{
				this.psychoJS.logger.warn("setting the mask of GratingStim: " + this._name + " with argument: undefined.");
				this.psychoJS.logger.debug("set the mask of GratingStim: " + this._name + " as: undefined");
			}
			else if (GratingStim.#SHADERS[mask] !== undefined)
			{
				// mask is a string and it is one of predefined functions available in shaders
				this.psychoJS.logger.debug("the mask is one of predefined functions. Set the mask of GratingStim: " + this._name + " as: " + mask);
			}
			else
			{
				// mask is a string: it should be the name of a resource, which we load
				if (typeof mask === "string")
				{
					mask = this.psychoJS.serverManager.getResource(mask);
				}

				// mask should now be an actual HTMLImageElement: we raise an error if it is not
				if (!(mask instanceof HTMLImageElement))
				{
					throw "the argument: " + mask.toString() + " is not an image\" }";
				}

				this.psychoJS.logger.debug("set the mask of GratingStim: " + this._name + " as: src= " + mask.src + ", size= " + mask.width + "x" + mask.height);
			}

			this._setAttribute("mask", mask, log);

			this._onChange(true, false)();
		}
		catch (error)
		{
			throw Object.assign(response, { error });
		}
	}

	/**
	 * Get the size of the display image, which is either that of the GratingStim or that of the image
	 * it contains.
	 *
	 * @name module:visual.GratingStim#_getDisplaySize
	 * @private
	 * @return {number[]} the size of the displayed image
	 */
	_getDisplaySize()
	{
		let displaySize = this.size;

		if (typeof displaySize === "undefined")
		{
			// use the size of the pixi element, if we have access to it:
			if (typeof this._pixi !== "undefined" && this._pixi.width > 0)
			{
				const pixiContainerSize = [this._pixi.width, this._pixi.height];
				displaySize = util.to_unit(pixiContainerSize, "pix", this.win, this.units);
			}
		}

		return displaySize;
	}

	/**
	 * Estimate the bounding box.
	 *
	 * @name module:visual.GratingStim#_estimateBoundingBox
	 * @function
	 * @override
	 * @protected
	 */
	_estimateBoundingBox()
	{
		const size = this._getDisplaySize();
		if (typeof size !== "undefined")
		{
			this._boundingBox = new PIXI.Rectangle(
				this._pos[0] - size[0] / 2,
				this._pos[1] - size[1] / 2,
				size[0],
				size[1],
			);
		}

		// TODO take the orientation into account
	}

	/**
	 * Generate PIXI.Mesh object based on provided shader function name and uniforms.
	 * 
	 * @name module:visual.GratingStim#_getPixiMeshFromPredefinedShaders
	 * @function
	 * @protected
	 * @param {String} funcName - name of the shader function. Must be one of the SHADERS
	 * @param {Object} uniforms - a set of uniforms to supply to the shader. Mixed together with default uniform values.
	 * @return {Pixi.Mesh} Pixi.Mesh object that represents shader and later added to the scene.
	 */
	_getPixiMeshFromPredefinedShaders (funcName = "", uniforms = {}) {
		const geometry = new PIXI.Geometry();
		geometry.addAttribute(
			"aVertexPosition",
			[
				0, 0,
				this._size_px[0], 0,
				this._size_px[0], this._size_px[1],
				0, this._size_px[1]
			],
			2
		);
		geometry.addAttribute(
			"aUvs",
			[0, 0, 1, 0, 1, 1, 0, 1],
			2
		);
		geometry.addIndex([0, 1, 2, 0, 2, 3]);
		const vertexSrc = defaultQuadVert;
		const fragmentSrc = GratingStim.#SHADERS[funcName].shader;
		const uniformsFinal = Object.assign({}, GratingStim.#SHADERS[funcName].uniforms, uniforms);
		const shader = PIXI.Shader.from(vertexSrc, fragmentSrc, uniformsFinal);
		return new PIXI.Mesh(geometry, shader);
	}

	/**
	 * Set phase value for the function.
	 * 
	 * @name module:visual.GratingStim#setPhase
	 * @public
	 * @param {number} phase - phase value
	 * @param {boolean} [log= false] - whether of not to log
	 */ 
	setPhase (phase, log = false) {
		this._setAttribute("phase", phase, log);
		if (this._pixi instanceof PIXI.Mesh) {
			this._pixi.shader.uniforms.uPhase = phase;
		} else if (this._pixi instanceof PIXI.TilingSprite) {
			this._pixi.tilePosition.x = -phase * (this._size_px[0] * this._pixi.tileScale.x) / (2 * Math.PI)
		}
	}

	/**
	 * Set spatial frequency value for the function.
	 * 
	 * @name module:visual.GratingStim#setSF
	 * @public
	 * @param {number} sf - spatial frequency value
	 * @param {boolean} [log=false] - whether or not to log
	 */ 
	setSF (sf, log = false) {
		this._setAttribute("SF", sf, log);
		if (this._pixi instanceof PIXI.Mesh) {
			this._pixi.shader.uniforms.uFreq = sf;
		} else if (this._pixi instanceof PIXI.TilingSprite) {
			// tileScale units are pixels, so converting function frequency to pixels
			// and also taking into account possible size difference between used texture and requested stim size
			this._pixi.tileScale.x = (1 / sf) * (this._pixi.width / this._pixi.texture.width);
			// since most functions defined in SHADERS assume spatial frequency change along X axis
			// we assume desired effect for image based stims to be the same so tileScale.y is not affected by spatialFrequency
			this._pixi.tileScale.y = this._pixi.height / this._pixi.texture.height;
		}
	}

	/**
	 * Update the stimulus, if necessary.
	 *
	 * @name module:visual.GratingStim#_updateIfNeeded
	 * @private
	 */
	_updateIfNeeded()
	{
		if (!this._needUpdate)
		{
			return;
		}
		this._needUpdate = false;

		// update the PIXI representation, if need be:
		if (this._needPixiUpdate)
		{
			this._needPixiUpdate = false;
			if (typeof this._pixi !== "undefined")
			{
				this._pixi.destroy(true);
			}
			this._pixi = undefined;

			// no image to draw: return immediately
			if (typeof this._tex === "undefined")
			{
				return;
			}

			if (this._tex instanceof HTMLImageElement)
			{
				this._pixi = PIXI.TilingSprite.from(this._tex, {
					width: this._size_px[0],
					height: this._size_px[1]
				});
				this.setPhase(this._phase);
				this.setSF(this._SF);
			}
			else
			{
				this._pixi = this._getPixiMeshFromPredefinedShaders(this._tex, {
					uFreq: this._SF,
					uPhase: this._phase
				});
			}
			this._pixi.pivot.set(this._pixi.width * 0.5, this._pixi.width * 0.5);

			// add a mask if need be:
			if (typeof this._mask !== "undefined")
			{
				if (this._mask instanceof HTMLImageElement)
				{
					this._pixi.mask = PIXI.Sprite.from(this._mask);
					this._pixi.mask.width = this._size_px[0];
					this._pixi.mask.height = this._size_px[1];
					this._pixi.addChild(this._pixi.mask);
				}
				else
				{
					// for some reason setting PIXI.Mesh as .mask doesn't do anything,
					// rendering mask to texture for further use.
					const maskMesh = this._getPixiMeshFromPredefinedShaders(this._mask);
					const rt = PIXI.RenderTexture.create({
						width: this._size_px[0],
						height: this._size_px[1]
					});
					this.win._renderer.render(maskMesh, {
						renderTexture: rt
					});
					const maskSprite = new PIXI.Sprite.from(rt);
					this._pixi.mask = maskSprite;
					this._pixi.addChild(maskSprite);
				}
			}

			// since _pixi.width may not be immediately available but the rest of the code needs its value
			// we arrange for repeated calls to _updateIfNeeded until we have a width:
			if (this._pixi.width === 0)
			{
				this._needUpdate = true;
				this._needPixiUpdate = true;
				return;
			}
		}

		this._pixi.zIndex = this._depth;
		this._pixi.alpha = this.opacity;

		// set the scale:
		const displaySize = this._getDisplaySize();
		this._size_px = util.to_px(displaySize, this.units, this.win);
		const scaleX = this._size_px[0] / this._pixi.width;
		const scaleY = this._size_px[1] / this._pixi.height;
		this._pixi.scale.x = this.flipHoriz ? -scaleX : scaleX;
		this._pixi.scale.y = this.flipVert ? scaleY : -scaleY;

		// set the position, rotation, and anchor (image centered on pos):
		let pos = to_pixiPoint(this.pos, this.units, this.win);
		this._pixi.position.set(pos.x, pos.y);
		this._pixi.rotation = -this.ori * Math.PI / 180;

		// re-estimate the bounding box, as the texture's width may now be available:
		this._estimateBoundingBox();
	}
}