<?php

namespace App\Service;

use App\Entity\User;
use App\Entity\Message;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mercure\HubInterface;
use Symfony\Component\Mercure\Update;
use Symfony\Component\HttpFoundation\Response;

class MessageService extends AbstractController { 
    private $em;
    private $hub;

    public function __construct(EntityManagerInterface $em, HubInterface $hub) {
        $this->em = $em;
        $this->hub = $hub;
    }

    public function sendMessage(string $content, string $author) {
        $message = new Message();
        $message->setContent($content);
        $message->setCreatedAt(new \DateTimeImmutable());
        $foundedAuthor = $this->em->getRepository(User::class)->findOneBy(['username' => $author]);
        $message->setAuthor($foundedAuthor);

        $this->em->persist($message);
        $this->em->flush();

        $update = new Update(
            'https://example.com/messages',
            json_encode([
                'content' => $content,
                'author' => $author,
                'created_at' => $message->getCreatedAt()->format('Y-m-d H:i:s')
            ])
        );

        try {
            $this->hub->publish($update);
            return new Response("Message published successfully", Response::HTTP_OK);
        } catch (\Exception $e) {
            return new Response("Error publishing message: " . $e->getMessage(), Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }
}