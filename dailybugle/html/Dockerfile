FROM httpd:latest

# Set the working directory to the document root
WORKDIR /usr/local/apache2/htdocs

# Copy HTML, CSS, and JavaScript files from the local machine to the container
COPY htdocs /usr/local/apache2/htdocs

# Copy Apache configuration files
COPY httpd.conf /usr/local/apache2/conf/httpd.conf
COPY proxy-html.conf /usr/local/apache2/conf/extra/proxy-html.conf
