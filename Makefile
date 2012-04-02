BUILD = $(CURDIR)/build
DIST = $(CURDIR)/dist
MARKLET_MODULES = public/marklet/intro.js \
				  public/marklet/bootstrap-transition.js \
				  public/marklet/bootstrap-modal.js \
				  public/assets/js/jade.runtime.js \
				  public/marklet/templates.js \
				  public/marklet/main.js \
				  public/marklet/outro.js

MARKLET_VER = 0.1

all:
	@@mkdir -p ${BUILD}
	@@jade -c -D --out public/marklet/templates.js views/marklet/
	@@cat ${MARKLET_MODULES} | \
			sed 's/(function( window ) {//' | \
			sed 's/}...window..;//' | \
			sed 's/((1))/1/' | \
			sed 's/window.jQuery/jQuery/' | \
			sed 's/@DATE/'"${DATE}"'/' | \
			sed "s/@VERSION/${MARKLET_VER}/" > build/marklet.js
	uglifyjs --unsafe build/marklet.js > public/marklet/marklet.js

