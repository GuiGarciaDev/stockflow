package com.duckstock.config;

import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import com.duckstock.service.SeedService;

import io.quarkus.arc.profile.IfBuildProfile;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;

@ApplicationScoped
@IfBuildProfile("dev")
public class DevSeedInitializer {

    private static final Logger LOG = Logger.getLogger(DevSeedInitializer.class);

    @ConfigProperty(name = "duckstock.seed.enabled", defaultValue = "false")
    boolean enabled;

    @ConfigProperty(name = "duckstock.seed.admin.email", defaultValue = "admin@stockflow.com")
    String adminEmail;

    @ConfigProperty(name = "duckstock.seed.admin.password", defaultValue = "admin123")
    String adminPassword;

    @ConfigProperty(name = "duckstock.seed.user.email", defaultValue = "user@stockflow.com")
    String userEmail;

    @ConfigProperty(name = "duckstock.seed.user.password", defaultValue = "user123")
    String userPassword;

    @Inject
    SeedService seedService;

    @SuppressWarnings("unused")
    void onStart(@Observes StartupEvent event) {
        if (!enabled) {
            LOG.debug("Dev seed disabled; starting with empty database.");
            return;
        }

        LOG.warn("Dev seed enabled: clearing and seeding database (development only). ");
        seedService.seed(adminEmail, adminPassword, userEmail, userPassword);
    }
}
