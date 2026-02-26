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
public class DevBootstrapInitializer {

    private static final Logger LOG = Logger.getLogger(DevBootstrapInitializer.class);

    @ConfigProperty(name = "duckstock.dev-bootstrap.enabled", defaultValue = "false")
    boolean enabled;

    @ConfigProperty(name = "duckstock.dev-bootstrap.admin.email", defaultValue = "test@gmail.com")
    String adminEmail;

    @ConfigProperty(name = "duckstock.dev-bootstrap.admin.password", defaultValue = "123456")
    String adminPassword;

    @Inject
    SeedService seedService;

    @SuppressWarnings("unused")
    void onStart(@Observes StartupEvent event) {
        if (!enabled) {
            LOG.debug("Dev bootstrap disabled; skipping startup seed.");
            return;
        }

        LOG.warn("Dev bootstrap enabled: seeding database and creating default ADMIN user for development only.");
        seedService.seedWithAdmin(adminEmail, adminPassword);
    }
}
