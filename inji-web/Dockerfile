# Use a more recent and secure Node.js version
FROM node:lts AS build

# Set the working directory in the container to /home/mosip
ARG container_user=mosip
WORKDIR /home/${container_user}

# Set build-time environment variables
ARG defaultTheme
ARG defaultLang
ARG defaultFavicon
ARG defaultTitle
ARG MIMOTO_URL
ARG IGNORED_ISSUER_IDS

# Set environment variables
ENV DEFAULT_THEME=$defaultTheme
ENV DEFAULT_LANG=$defaultLang
ENV DEFAULT_FAVICON=$defaultFavicon
ENV DEFAULT_TITLE=$defaultTitle
ENV MIMOTO_URL=$MIMOTO_URL
ENV IGNORED_ISSUER_IDS=$IGNORED_ISSUER_IDS

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies in a clean state
RUN npm ci

# Copy the application code
COPY . .

# Build the React app
RUN npm run build

# Use a specific, secure Nginx version
FROM nginx:1.28.0-alpine3.21-slim
RUN apk add --no-cache shadow
# Set ARGs as environment variables
ARG SOURCE
ARG COMMIT_HASH
ARG COMMIT_ID
ARG BUILD_TIME

LABEL source=${SOURCE}
LABEL commit_hash=${COMMIT_HASH}
LABEL commit_id=${COMMIT_ID}
LABEL build_time=${BUILD_TIME}

# Define a non-root user
ARG container_user=mosip
ARG container_user_group=mosip
ARG container_user_uid=1001
ARG container_user_gid=1001

ENV nginx_dir=/usr/share/nginx
ENV work_dir=${nginx_dir}/html

# Set up a user with limited privileges
RUN groupadd -g ${container_user_gid} ${container_user_group} \
    && useradd -u ${container_user_uid} -g ${container_user_group} -s /bin/sh -m ${container_user} \
    && mkdir -p /var/run/nginx /var/tmp/nginx /temp /var/cache/nginx \
    && touch /var/run/nginx.pid \
    && chown -R ${container_user}:${container_user} /var/run/nginx /temp /var/cache/nginx /var/run/nginx.pid

# Copy the built React app and Nginx configuration
COPY --from=build /home/${container_user}/build ${work_dir}
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Create the environment variables file in the new work directory
RUN echo "DEFAULT_THEME=${DEFAULT_THEME}" >> ${work_dir}/env.env \
    && echo "DEFAULT_LANG=${DEFAULT_LANG}" >> ${work_dir}/env.env \
    && echo "MIMOTO_URL=${MIMOTO_URL}" >> ${work_dir}/env.env \
    && echo "DEFAULT_FAVICON=${DEFAULT_FAVICON}" >> ${work_dir}/env.env \
    && echo "DEFAULT_TITLE=${DEFAULT_TITLE}" >> ${work_dir}/env.env \
    && echo "IGNORED_ISSUER_IDS=${IGNORED_ISSUER_IDS}" >> ${work_dir}/env.env

# Copy and set permissions for the startup script
COPY configure_start.sh /home/${container_user}/configure_start.sh
RUN chmod +x /home/${container_user}/configure_start.sh && chown ${container_user}:${container_user} /home/${container_user}/configure_start.sh

# Set ownership of the HTML directory
RUN chown -R ${container_user}:${container_user} ${work_dir}

# Switch to the non-root user and set the working directory
USER ${container_user_uid}:${container_user_gid}
WORKDIR /home/${container_user}

# Expose port 3004
EXPOSE 3004

ENTRYPOINT ["./configure_start.sh"]

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]