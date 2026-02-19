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
        HikariDataSource dataSource = new HikariDataSource();

        // Trim whitespace from the URL - critical for Render env vars
        String cleanUrl = databaseUrl != null ? databaseUrl.trim() : "";
        logger.info("Using Database URL (trimmed, length: {})", cleanUrl.length());

        // Ensure jdbc: prefix is present (and not double-prefixed)
        if (!cleanUrl.startsWith("jdbc:")) {
            cleanUrl = "jdbc:" + cleanUrl;
        }

        dataSource.setJdbcUrl(cleanUrl);
        dataSource.setDriverClassName("org.postgresql.Driver");

        // Apply memory-saving settings programmatically
        dataSource.setMaximumPoolSize(3);
        dataSource.setMinimumIdle(1);
        dataSource.setIdleTimeout(300000);
        dataSource.setConnectionTimeout(20000);
        dataSource.setMaxLifetime(1800000);
        dataSource.setLeakDetectionThreshold(2000);

        return dataSource;
    }
}
