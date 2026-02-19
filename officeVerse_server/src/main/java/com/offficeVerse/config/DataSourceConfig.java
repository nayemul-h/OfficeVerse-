package com.offficeVerse.config;

import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.context.annotation.Profile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.sql.DataSource;

@Configuration
@Profile("prod")
public class DataSourceConfig {

    private static final Logger logger = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${DATABASE_URL}")
    private String databaseUrl;

    @Bean
    @Primary
    public DataSource dataSource() {
        logger.info("Initializing Custom DataSource for Production Profile");

        // Use System.getenv to get the raw value, bypassing Spring property resolution
        // if possible
        String rawEnvUrl = System.getenv("DATABASE_URL");
        if (rawEnvUrl == null) {
            rawEnvUrl = databaseUrl; // Fallback to @Value
        }

        // Aggressively clean the URL: trim and remove all non-printable characters
        String cleanUrl = rawEnvUrl != null ? rawEnvUrl.trim().replaceAll("[^\\x20-\\x7E]", "") : "";
        logger.info("Sanitized Database URL (length: {})", cleanUrl.length());

        // Standardize the protocol
        // Neon sometimes provides postgres://, but JDBC requires jdbc:postgresql://
        if (cleanUrl.startsWith("jdbc:postgresql://")) {
            // Already perfect
        } else if (cleanUrl.startsWith("jdbc:postgres://")) {
            cleanUrl = cleanUrl.replace("jdbc:postgres://", "jdbc:postgresql://");
        } else if (cleanUrl.startsWith("postgresql://")) {
            cleanUrl = "jdbc:" + cleanUrl;
        } else if (cleanUrl.startsWith("postgres://")) {
            cleanUrl = "jdbc:postgresql://" + cleanUrl.substring(11);
        } else {
            // If it's just host:port/db or similar, assume postgresql
            if (!cleanUrl.isEmpty() && !cleanUrl.startsWith("jdbc:")) {
                cleanUrl = "jdbc:postgresql://" + cleanUrl;
            }
        }

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(cleanUrl);
        dataSource.setDriverClassName("org.postgresql.Driver");

        // Apply memory-saving settings
        dataSource.setMaximumPoolSize(3);
        dataSource.setMinimumIdle(1);
        dataSource.setIdleTimeout(300000);
        dataSource.setConnectionTimeout(20000);
        dataSource.setMaxLifetime(1800000);
        dataSource.setLeakDetectionThreshold(2000);

        logger.info("DataSource configured successfully with URL: {}...",
                cleanUrl.substring(0, Math.min(cleanUrl.length(), 30)));
        return dataSource;
    }
}
