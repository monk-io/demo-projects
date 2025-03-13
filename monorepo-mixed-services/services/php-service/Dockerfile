FROM php:8.1-apache
WORKDIR /var/www/html
COPY composer.json .
RUN apt-get update && apt-get install -y unzip \
    && curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer \
    && composer install
COPY index.php .
EXPOSE 80
CMD ["apache2-foreground"] 