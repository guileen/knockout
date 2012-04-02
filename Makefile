BUILD = $(CURDIR)/build
DIST = $(CURDIR)/dist
BUILD_TEMPLATE = build/templates.js
TEMPLATE = public/marklet/templates.js
MARKLET_MODULES = public/marklet/intro.js \
				  public/marklet/bootstrap-transition.js \
				  public/marklet/bootstrap-tooltip.js \
				  public/marklet/bootstrap-popover.js \
				  public/marklet/bootstrap-modal.js \
				  public/assets/js/jade.runtime.js \
				  ${TEMPLATE} \
				  public/marklet/main.js \
				  public/marklet/outro.js

MARKLET_VER = 0.1

all:
	@@mkdir -p ${BUILD}
	@@jade -c -D --out ${BUILD_TEMPLATE} views/marklet/
	@@cat ${BUILD_TEMPLATE} | \
			sed 's/jade.templates...marklet.jade../var marklet_template/' | \
			sed 's/@DATE/'"${DATE}"'/' > ${TEMPLATE}
	@@cat ${MARKLET_MODULES} | \
			sed 's/(function( window ) {//' | \
			sed 's/}...window..;//' | \
			sed 's/((1))/1/' | \
			sed 's/window.jQuery/jQuery/' | \
			sed 's/@DATE/'"${DATE}"'/' | \
			sed "s/@VERSION/${MARKLET_VER}/" > build/marklet.js
	uglifyjs --unsafe build/marklet.js > public/marklet/marklet.js

