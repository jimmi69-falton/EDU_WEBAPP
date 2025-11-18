package com.hrmanagement.config;

import com.hrmanagement.model.User;
import com.hrmanagement.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        try {
            logger.info("🔍 Checking for demo user...");
            // Tạo user demo nếu chưa tồn tại
            // Check admin user
            userRepository.findByEmail("admin@edu.com").ifPresentOrElse(existing -> {
                logger.info("📋 Demo admin user found, checking password...");
                if (!passwordEncoder.matches("admin123", existing.getPassword())) {
                    existing.setPassword(passwordEncoder.encode("admin123"));
                    existing.setRole("admin");
                    userRepository.save(existing);
                    logger.info("✅ Demo admin user password reset.");
                } else {
                    logger.info("✅ Demo admin user already exists.");
                }
            }, () -> {
                logger.info("📝 Creating new demo users...");
                
                // Admin user
                User adminUser = new User();
                adminUser.setName("Admin User");
                adminUser.setEmail("admin@edu.com");
                adminUser.setPassword(passwordEncoder.encode("admin123"));
                adminUser.setRole("admin");
                userRepository.save(adminUser);
                
                // Teacher user
                User teacherUser = new User();
                teacherUser.setName("Teacher User");
                teacherUser.setEmail("teacher@edu.com");
                teacherUser.setPassword(passwordEncoder.encode("teacher123"));
                teacherUser.setRole("teacher");
                userRepository.save(teacherUser);
                
                // Student user
                User studentUser = new User();
                studentUser.setName("Student User");
                studentUser.setEmail("student@edu.com");
                studentUser.setPassword(passwordEncoder.encode("student123"));
                studentUser.setRole("student");
                userRepository.save(studentUser);
                
                logger.info("✅ Demo users created successfully!");
                logger.info("   Admin - Email: admin@edu.com, Password: admin123");
                logger.info("   Teacher - Email: teacher@edu.com, Password: teacher123");
                logger.info("   Student - Email: student@edu.com, Password: student123");
            });
        } catch (Exception e) {
            logger.error("❌ Error initializing demo user: ", e);
        }
    }
}

