FROM ruby:3.1-alpine
WORKDIR /app
COPY Gemfile .
RUN gem install bundler && bundle install
COPY app.rb .
EXPOSE 4567
CMD ["ruby", "app.rb"] 