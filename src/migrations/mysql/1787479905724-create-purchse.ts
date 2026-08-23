import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatePurchse1787479905724 implements MigrationInterface {
    name = 'CreatePurchse1787479905724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`purchases\` (\`id\` int NOT NULL AUTO_INCREMENT, \`amount\` decimal(10,2) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`user\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`purchases\` ADD CONSTRAINT \`FK_45318bc6ce7f42c41c74e3dce22\` FOREIGN KEY (\`user\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`purchases\` DROP FOREIGN KEY \`FK_45318bc6ce7f42c41c74e3dce22\``);
        await queryRunner.query(`DROP TABLE \`purchases\``);
    }

}
