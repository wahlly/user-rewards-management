import { MigrationInterface, QueryRunner } from "typeorm";

export class Rewards1787440050699 implements MigrationInterface {
    name = 'Rewards1787440050699'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`user_badges\` (\`id\` int NOT NULL AUTO_INCREMENT, \`badge_name\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`user_achievements\` (\`id\` int NOT NULL AUTO_INCREMENT, \`achievementName\` varchar(255) NOT NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`user\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`user_badges\` ADD CONSTRAINT \`FK_63d994462a8d0fcb6235cc91f74\` FOREIGN KEY (\`user\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`user_achievements\` ADD CONSTRAINT \`FK_725c0df94812847dda212553096\` FOREIGN KEY (\`user\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`user_achievements\` DROP FOREIGN KEY \`FK_725c0df94812847dda212553096\``);
        await queryRunner.query(`ALTER TABLE \`user_badges\` DROP FOREIGN KEY \`FK_63d994462a8d0fcb6235cc91f74\``);
        await queryRunner.query(`DROP TABLE \`user_achievements\``);
        await queryRunner.query(`DROP TABLE \`user_badges\``);
    }

}
