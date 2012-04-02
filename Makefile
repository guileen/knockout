BUILD = $(CURDIR)/build
DIST = $(CURDIR)/dist
MARKLET_MODULES = public/assets/js/intro.js \
				  public/assets/js/marklet-transition.js \
				  public/assets/js/marklet-modal.js \
				  public/assets/js/jade.runtime.js \
				  public/assets/js/marklet-templates.js \
				  public/assets/js/marklet-main.js \
				  public/assets/js/outro.js

MARKLET_VER = 0.1

all:
	mkdir -p ${BUILD}
	jade -c -D --out public/assets/js/marklet-templates.js views/marklet/
	cat ${MARKLET_MODULES} | \
			sed 's/(function( window ) {//' | \
			sed 's/}...window..;//' | \
			sed 's/((1))/1/' | \
			sed 's/window.jQuery/jQuery/' | \
			sed 's/@DATE/'"${DATE}"'/' | \
			sed "s/@VERSION/${MARKLET_VER}/" > build/marklet.js
	uglifyjs --unsafe build/marklet.js > public/assets/js/marklet.js

