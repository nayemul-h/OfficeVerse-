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
        logger.info("Initializing Hardened Custom DataSource for Production Profile");

        String rawEnvUrl = System.getenv("DATABASE_URL");
        if (rawEnvUrl == null) {
            rawEnvUrl = databaseUrl;
        }

        // 1. Aggressive cleaning of all whitespace and non-printables
        String cleanRaw = rawEnvUrl != null ? rawEnvUrl.trim().replaceAll("[^\\x20-\\x7E]", "") : "";

        String dbUser = null;
        String dbPass = null;
        String jdbcUrl = cleanRaw;

        try {
            // Support formats like postgresql://user:pass@host:port/db
            String authorityAndPath = cleanRaw;
            if (authorityAndPath.contains("://")) {
                authorityAndPath = authorityAndPath.substring(authorityAndPath.indexOf("://") + 3);
            }

            if (authorityAndPath.contains("@")) {
                String[] authParts = authorityAndPath.split("@", 2);
                String userPass = authParts[0];
                String remaining = authParts[1];

                if (userPass.contains(":")) {
                    String[] up = userPass.split(":", 2);
                    dbUser = up[0];
                    dbPass = up[1];
                } else {
                    dbUser = userPass;
                }

                // Construct clean JDBC URL without credentials
                jdbcUrl = "jdbc:postgresql://" + remaining;
            } else {
                // Handle missing prefixes
                if (!cleanRaw.startsWith("jdbc:postgresql:")) {
                    if (cleanRaw.startsWith("postgresql://")) {
                        jdbcUrl = "jdbc:" + cleanRaw;
                    } else if (cleanRaw.startsWith("postgres://")) {
                        jdbcUrl = "jdbc:postgresql://" + cleanRaw.substring(11);
                    } else {
                        jdbcUrl = "jdbc:postgresql://" + cleanRaw;
                    }
                }
            }
        } catch (Exception e) {
            logger.error("Error parsing DATABASE_URL: {}", e.getMessage());
        }

        logger.info("Final JDBC URL: {}", jdbcUrl);

        HikariDataSource dataSource = new HikariDataSource();
        dataSource.setJdbcUrl(jdbcUrl);
        if (dbUser != null)
            dataSource.setUsername(dbUser);
        if (dbPass != null)
            dataSource.setPassword(dbPass);

        dataSource.setDriverClassName("org.postgresql.Driver");

        // Apply memory-saving settings
        dataSource.setMaximumPoolSize(3);
        dataSource.setMinimumIdle(1);
        dataSource.setIdleTimeout(300000);
        dataSource.setConnectionTimeout(20000);
        dataSource.setMaxLifetime(1800000);
        dataSource.setLeakDetectionThreshold(2000);

        // Neon-specific SSL
        dataSource.addDataSourceProperty("ssl", "true");
        dataSource.addDataSourceProperty("sslmode", "require");

        return dataSource;
    }
}
