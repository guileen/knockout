BUILD = $(CURDIR)/build
DIST = $(CURDIR)/dist
BASE_URL = http:\/\/dev:3000\/
STAGE_TEMPLATE = public/marklet/stage_template.js
TB_TEMPLATE = public/marklet/tb_template.js
MARKLET_MODULES = public/marklet/intro.js \
				  public/marklet/bootstrap-transition.js \
				  public/marklet/bootstrap-tooltip.js \
				  public/marklet/bootstrap-popover.js \
				  public/marklet/bootstrap-modal.js \
				  public/assets/js/jade.runtime.js \
				  ${STAGE_TEMPLATE} \
				  ${TB_TEMPLATE} \
				  public/marklet/main.js \
				  public/marklet/outro.js
MARKLET_JS = public/marklet/marklet.js

MARKLET_VER = 0.1

all:
	@@mkdir -p ${BUILD}
	@@jade -c -D --out ${STAGE_TEMPLATE} --var stage_template views/marklet/stage.jade
	@@jade -c -D --out ${TB_TEMPLATE} --var tb_template views/marklet/tb.jade
	@@cat ${MARKLET_MODULES} | \
			sed 's/(function( window ) {//' | \
			sed 's/}...window..;//' | \
			sed 's/((1))/1/' | \
			sed 's/window.jQuery/jQuery/' | \
			sed 's/@DATE/'"${DATE}"'/' | \
			sed 's/@BASE_URL/'"${BASE_URL}"'/' | \
			sed "s/@VERSION/${MARKLET_VER}/" > ${MARKLET_JS}
	uglifyjs --unsafe ${MARKLET_JS} > public/marklet/marklet.min.js
	@@echo make done.
