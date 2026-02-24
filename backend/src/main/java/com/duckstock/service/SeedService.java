package com.duckstock.service;

import com.duckstock.entity.Product;
import com.duckstock.entity.ProductRawMaterial;
import com.duckstock.entity.RawMaterial;
import com.duckstock.entity.User;
import com.duckstock.security.PasswordEncoder;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.jboss.logging.Logger;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;

@ApplicationScoped
public class SeedService {

    private static final Logger LOG = Logger.getLogger(SeedService.class);

    @Inject
    PasswordEncoder passwordEncoder;

    // Product names in Portuguese
    private static final String[] PRODUCT_NAMES = {
            "Mesa de Jantar Premium", "Cadeira Estofada", "Guarda-Roupa Casal",
            "Armário de Cozinha", "Escrivaninha Moderna", "Estante de Livros",
            "Cama Queen Size", "Rack para TV", "Mesa de Centro",
            "Bancada de Trabalho", "Poltrona Decorativa", "Criado-Mudo",
            "Cômoda 6 Gavetas", "Aparador de Sala", "Mesa Dobrável",
            "Sapateira Vertical", "Gaveteiro de Escritório", "Painel para TV",
            "Banco de Madeira", "Nicho Decorativo",
            "Mesa de Jantar 6 Lugares", "Cadeira de Escritório Giratória",
            "Guarda-Roupa Solteiro", "Armário Multiuso", "Escrivaninha Compacta",
            "Estante Industrial", "Cama Box Solteiro", "Rack Suspenso",
            "Mesa Lateral", "Bancada Gourmet"
    };

    // Raw material names in Portuguese
    private static final String[] RAW_MATERIAL_NAMES = {
            "Tábua de Madeira", "Painel MDF", "Parafuso", "Verniz",
            "Tinta Acrílica", "Barra de Aço", "Trilho Metálico", "Dobradiça",
            "Puxador", "Espuma", "Tecido", "Vidro Temperado",
            "Cola Industrial", "Lixa", "Rodízio", "Prego",
            "Cantoneira", "Tubo Metálico", "Compensado", "Revestimento Laminado",
            "Tábua de Pinus", "Painel MDF Cru", "Parafuso Philips",
            "Verniz Marítimo", "Tinta Branca", "Barra de Alumínio",
            "Trilho Telescópico", "Dobradiça de Pressão", "Puxador de Alumínio",
            "Espuma D28", "Tecido Suede", "Vidro Comum",
            "Cola de Contato", "Lixa D'água", "Rodízio Giratório",
            "Prego Galvanizado", "Cantoneira de Aço", "Tubo Redondo",
            "Compensado Naval", "Revestimento PVC",
            "Fita de Borda", "Parafuso Sextavado", "Feltro Adesivo",
            "Corrediça", "Chapa de MDF", "Pé de Mesa",
            "Suporte de Prateleira", "Fechadura para Móvel",
            "Amortecedor de Porta", "Gancho Metálico"
    };

    private static final String[] UNITS = {"un", "m", "m²", "kg", "L", "pç"};

    @Transactional
    public Map<String, Object> seed() {
        LOG.info("Starting database seed...");

        // Clear existing data
        ProductRawMaterial.deleteAll();
        Product.deleteAll();
        RawMaterial.deleteAll();
        User.deleteAll();

        Random random = new Random(42);

        // Create admin user
        User admin = new User();
        admin.name = "Admin DuckStock";
        admin.email = "admin@duckstock.com";
        admin.password = passwordEncoder.encode("admin123");
        admin.role = "ADMIN";
        admin.persist();

        // Create regular user
        User user = new User();
        user.name = "User DuckStock";
        user.email = "user@duckstock.com";
        user.password = passwordEncoder.encode("user123");
        user.role = "USER";
        user.persist();

        // Create raw materials (50+)
        List<RawMaterial> rawMaterials = new ArrayList<>();
        for (String name : RAW_MATERIAL_NAMES) {
            RawMaterial rm = new RawMaterial();
            rm.name = name;
            rm.description = "Material: " + name;
            rm.price = BigDecimal.valueOf(5 + random.nextDouble() * 195)
                    .setScale(2, RoundingMode.HALF_UP);
            rm.stockQuantity = 50 + random.nextInt(951); // 50-1000
            rm.unit = UNITS[random.nextInt(UNITS.length)];
            rm.persist();
            rawMaterials.add(rm);
        }

        // Create products (30+)
        List<Product> products = new ArrayList<>();
        for (String name : PRODUCT_NAMES) {
            Product product = new Product();
            product.name = name;
            product.description = "Produto premium: " + name;
            product.price = BigDecimal.valueOf(100 + random.nextDouble() * 4900)
                    .setScale(2, RoundingMode.HALF_UP);
            product.stockQuantity = random.nextInt(101); // 0-100
            product.persist();
            products.add(product);
        }

        // Create random associations (each product gets 2-6 raw materials)
        int totalAssociations = 0;
        for (Product product : products) {
            int numMaterials = 2 + random.nextInt(5); // 2-6 materials
            Set<Integer> usedIndices = new HashSet<>();

            for (int i = 0; i < numMaterials; i++) {
                int rmIndex;
                do {
                    rmIndex = random.nextInt(rawMaterials.size());
                } while (usedIndices.contains(rmIndex));
                usedIndices.add(rmIndex);

                ProductRawMaterial prm = new ProductRawMaterial();
                prm.product = product;
                prm.rawMaterial = rawMaterials.get(rmIndex);
                prm.quantityNeeded = 1 + random.nextInt(10); // 1-10
                prm.persist();
                totalAssociations++;
            }
        }

        LOG.infof("Seed completed: %d products, %d raw materials, %d associations",
                products.size(), rawMaterials.size(), totalAssociations);

        Map<String, Object> result = new HashMap<>();
        result.put("products", products.size());
        result.put("rawMaterials", rawMaterials.size());
        result.put("associations", totalAssociations);
        result.put("users", 2);
        result.put("message", "Seed completed successfully");
        return result;
    }
}
